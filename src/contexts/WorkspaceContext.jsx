import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import useAuth from "../hooks/useAuth";
import {
  createOrganization,
  getOrganizationAccess,
  listOrganizations,
  updateOrganization,
} from "../services/organization-service";
import {
  getWorkspaceDisplayName,
  isPlaceholderWorkspaceName,
} from "../utils/workspace-name";

const ACTIVE_ORGANIZATION_KEY = "novera.active-organization-id";

export const WorkspaceContext = createContext(null);

function getStoredOrganizationId() {
  return localStorage.getItem(ACTIVE_ORGANIZATION_KEY);
}

function storeOrganizationId(organizationId) {
  if (organizationId) {
    localStorage.setItem(ACTIVE_ORGANIZATION_KEY, organizationId);
  } else {
    localStorage.removeItem(ACTIVE_ORGANIZATION_KEY);
  }
}

export function WorkspaceProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [activeOrganizationId, setActiveOrganizationId] = useState(null);
  const [access, setAccess] = useState(null);
  const [status, setStatus] = useState("idle");
  const [accessStatus, setAccessStatus] = useState("idle");
  const [error, setError] = useState(null);
  const accessRequestRef = useRef(0);

  const loadAccess = useCallback(async (organizationId) => {
    if (!organizationId) {
      setAccess(null);
      setAccessStatus("idle");
      return null;
    }

    const requestId = accessRequestRef.current + 1;
    accessRequestRef.current = requestId;
    setAccessStatus("loading");

    try {
      const payload = await getOrganizationAccess(organizationId);
      if (requestId === accessRequestRef.current) {
        setAccess(payload);
        setAccessStatus("ready");
      }
      return payload;
    } catch (requestError) {
      if (requestId === accessRequestRef.current) {
        setAccess(null);
        setAccessStatus("error");
      }
      throw requestError;
    }
  }, []);

  const activateOrganization = useCallback(
    async (organizationId) => {
      setActiveOrganizationId(organizationId || null);
      storeOrganizationId(organizationId || null);
      setAccess(null);
      return loadAccess(organizationId || null);
    },
    [loadAccess],
  );

  const refreshOrganizations = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const payload = await listOrganizations();
      const nextOrganizations = Array.isArray(payload) ? payload : [];
      setOrganizations(nextOrganizations);

      if (nextOrganizations.length === 0) {
        setActiveOrganizationId(null);
        storeOrganizationId(null);
        setAccess(null);
        setAccessStatus("idle");
      } else {
        const storedId = getStoredOrganizationId();
        const selected =
          nextOrganizations.find((organization) => organization.id === storedId) ||
          nextOrganizations[0];
        setActiveOrganizationId(selected.id);
        storeOrganizationId(selected.id);
        await loadAccess(selected.id);
      }

      setStatus("ready");
      return nextOrganizations;
    } catch (requestError) {
      setStatus("error");
      setError(requestError);
      throw requestError;
    }
  }, [loadAccess]);

  useEffect(() => {
    if (!isAuthenticated) {
      setOrganizations([]);
      setActiveOrganizationId(null);
      setAccess(null);
      setStatus("idle");
      setAccessStatus("idle");
      setError(null);
      return;
    }

    refreshOrganizations().catch(() => {
      // Error state is exposed through context and rendered by consumers.
    });
  }, [isAuthenticated, refreshOrganizations]);

  const createWorkspace = useCallback(
    async (payload) => {
      const organization = await createOrganization(payload);
      setOrganizations((current) => [
        ...current.filter((item) => item.id !== organization.id),
        organization,
      ]);
      setStatus("ready");
      await activateOrganization(organization.id);
      return organization;
    },
    [activateOrganization],
  );

  const updateWorkspace = useCallback(async (organizationId, payload) => {
    const organization = await updateOrganization(organizationId, payload);
    setOrganizations((current) => {
      const exists = current.some((item) => item.id === organization.id);
      if (!exists) return [...current, organization];
      return current.map((item) =>
        item.id === organization.id ? organization : item,
      );
    });
    return organization;
  }, []);

  const activeOrganization = useMemo(
    () =>
      organizations.find(
        (organization) => organization.id === activeOrganizationId,
      ) || null,
    [activeOrganizationId, organizations],
  );

  const permissionNames = useMemo(() => {
    const direct = access?.membership?.permission_names;
    if (Array.isArray(direct)) return direct;

    const rolePermissions = access?.membership?.role?.permissions;
    if (Array.isArray(rolePermissions)) {
      return rolePermissions.map((permission) => permission.name).filter(Boolean);
    }

    return [];
  }, [access]);

  const permissionSet = useMemo(
    () => new Set(permissionNames.map((name) => name.toLowerCase())),
    [permissionNames],
  );

  const hasPermission = useCallback(
    (permissionName) => permissionSet.has(permissionName.toLowerCase()),
    [permissionSet],
  );

  const requiresWorkspaceRename = Boolean(
    activeOrganization && isPlaceholderWorkspaceName(activeOrganization.name),
  );
  const activeOrganizationDisplayName = getWorkspaceDisplayName(
    activeOrganization?.name,
  );

  const value = useMemo(
    () => ({
      organizations,
      activeOrganization,
      activeOrganizationDisplayName,
      activeOrganizationId,
      access,
      permissionNames,
      status,
      accessStatus,
      error,
      isLoading: status === "loading",
      isReady: status === "ready",
      hasWorkspace: Boolean(activeOrganization),
      requiresWorkspaceRename,
      activateOrganization,
      createWorkspace,
      updateWorkspace,
      refreshOrganizations,
      hasPermission,
    }),
    [
      access,
      accessStatus,
      activateOrganization,
      activeOrganization,
      activeOrganizationDisplayName,
      activeOrganizationId,
      createWorkspace,
      error,
      hasPermission,
      organizations,
      permissionNames,
      refreshOrganizations,
      requiresWorkspaceRename,
      status,
      updateWorkspace,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
