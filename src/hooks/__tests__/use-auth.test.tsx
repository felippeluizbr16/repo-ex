import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../use-auth";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Typed imports (after vi.mock hoisting)
// ---------------------------------------------------------------------------
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ANON_MESSAGES = [{ id: "1", role: "user", content: "hello" }];
const ANON_FS_DATA = { "/App.jsx": { type: "file", content: "export default () => <div/>" } };

function makeProject(id = "proj-1", name = "Test") {
  return { id, name, createdAt: new Date(), updatedAt: new Date() };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Safe defaults – every action succeeds, no anon work, no existing projects
    (signInAction as any).mockResolvedValue({ success: true });
    (signUpAction as any).mockResolvedValue({ success: true });
    (getAnonWorkData as any).mockReturnValue(null);
    (getProjects as any).mockResolvedValue([]);
    (createProject as any).mockResolvedValue(makeProject());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // isLoading state
  // -------------------------------------------------------------------------
  describe("isLoading", () => {
    test("is false initially", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isLoading).toBe(false);
    });

    test("is set to true while signIn is in progress, then back to false", async () => {
      let resolveSignIn!: () => void;
      (signInAction as any).mockImplementation(
        () => new Promise((resolve) => { resolveSignIn = () => resolve({ success: false }); })
      );

      const { result } = renderHook(() => useAuth());

      // kick off signIn but do not await it yet
      let signInPromise: ReturnType<typeof result.current.signIn>;
      act(() => {
        signInPromise = result.current.signIn("a@b.com", "password");
      });

      // while pending, isLoading should be true
      await act(async () => {
        expect(result.current.isLoading).toBe(true);
      });

      // resolve and finish
      await act(async () => {
        resolveSignIn();
        await signInPromise!;
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("is set to true while signUp is in progress, then back to false", async () => {
      let resolveSignUp!: () => void;
      (signUpAction as any).mockImplementation(
        () => new Promise((resolve) => { resolveSignUp = () => resolve({ success: false }); })
      );

      const { result } = renderHook(() => useAuth());

      let signUpPromise: ReturnType<typeof result.current.signUp>;
      act(() => {
        signUpPromise = result.current.signUp("a@b.com", "password");
      });

      await act(async () => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolveSignUp();
        await signUpPromise!;
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("resets isLoading even when signIn action throws", async () => {
      (signInAction as any).mockRejectedValue(new Error("network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await expect(result.current.signIn("a@b.com", "password")).rejects.toThrow("network error");
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("resets isLoading even when signUp action throws", async () => {
      (signUpAction as any).mockRejectedValue(new Error("network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await expect(result.current.signUp("a@b.com", "password")).rejects.toThrow("network error");
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // signIn – return value & action invocation
  // -------------------------------------------------------------------------
  describe("signIn", () => {
    test("calls signIn action with provided credentials", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "s3cret!");
      });

      expect(signInAction).toHaveBeenCalledWith("user@example.com", "s3cret!");
    });

    test("returns the result from the signIn action on success", async () => {
      (signInAction as any).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useAuth());

      let authResult!: Awaited<ReturnType<typeof result.current.signIn>>;
      await act(async () => {
        authResult = await result.current.signIn("a@b.com", "password");
      });

      expect(authResult).toEqual({ success: true });
    });

    test("returns the error result from the signIn action on failure", async () => {
      const errorResult = { success: false, error: "Invalid credentials" };
      (signInAction as any).mockResolvedValue(errorResult);

      const { result } = renderHook(() => useAuth());

      let authResult!: Awaited<ReturnType<typeof result.current.signIn>>;
      await act(async () => {
        authResult = await result.current.signIn("a@b.com", "wrong");
      });

      expect(authResult).toEqual(errorResult);
    });

    test("does not trigger post-sign-in logic when signIn fails", async () => {
      (signInAction as any).mockResolvedValue({ success: false, error: "bad" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("a@b.com", "wrong");
      });

      expect(getProjects).not.toHaveBeenCalled();
      expect(createProject).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // signUp – return value & action invocation
  // -------------------------------------------------------------------------
  describe("signUp", () => {
    test("calls signUp action with provided credentials", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("new@example.com", "longpassword");
      });

      expect(signUpAction).toHaveBeenCalledWith("new@example.com", "longpassword");
    });

    test("returns the result from the signUp action on success", async () => {
      (signUpAction as any).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useAuth());

      let authResult!: Awaited<ReturnType<typeof result.current.signUp>>;
      await act(async () => {
        authResult = await result.current.signUp("a@b.com", "password");
      });

      expect(authResult).toEqual({ success: true });
    });

    test("returns the error result from the signUp action on failure", async () => {
      const errorResult = { success: false, error: "Email already registered" };
      (signUpAction as any).mockResolvedValue(errorResult);

      const { result } = renderHook(() => useAuth());

      let authResult!: Awaited<ReturnType<typeof result.current.signUp>>;
      await act(async () => {
        authResult = await result.current.signUp("a@b.com", "password");
      });

      expect(authResult).toEqual(errorResult);
    });

    test("does not trigger post-sign-up logic when signUp fails", async () => {
      (signUpAction as any).mockResolvedValue({ success: false, error: "bad" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("a@b.com", "short");
      });

      expect(getProjects).not.toHaveBeenCalled();
      expect(createProject).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Post-sign-in navigation – anonymous work present
  // -------------------------------------------------------------------------
  describe("post-sign-in: anonymous work exists", () => {
    beforeEach(() => {
      (getAnonWorkData as any).mockReturnValue({
        messages: ANON_MESSAGES,
        fileSystemData: ANON_FS_DATA,
      });
    });

    test("creates a project from anonymous work and navigates to it via signIn", async () => {
      const created = makeProject("anon-proj");
      (createProject as any).mockResolvedValue(created);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("a@b.com", "password");
      });

      expect(createProject).toHaveBeenCalledWith({
        name: expect.any(String),
        messages: ANON_MESSAGES,
        data: ANON_FS_DATA,
      });
      expect(clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/anon-proj");
    });

    test("creates a project from anonymous work and navigates to it via signUp", async () => {
      const created = makeProject("anon-proj-2");
      (createProject as any).mockResolvedValue(created);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("new@b.com", "password");
      });

      expect(createProject).toHaveBeenCalledWith({
        name: expect.any(String),
        messages: ANON_MESSAGES,
        data: ANON_FS_DATA,
      });
      expect(clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/anon-proj-2");
    });

    test("does not call getProjects when anonymous work is consumed", async () => {
      (createProject as any).mockResolvedValue(makeProject());

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("a@b.com", "password");
      });

      expect(getProjects).not.toHaveBeenCalled();
    });

    test("project name includes a time string", async () => {
      (createProject as any).mockResolvedValue(makeProject());

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("a@b.com", "password");
      });

      const projectName = (createProject as any).mock.calls[0][0].name as string;
      expect(projectName).toMatch(/^Design from /);
    });
  });

  // -------------------------------------------------------------------------
  // Post-sign-in navigation – anon work with empty messages (edge case)
  // -------------------------------------------------------------------------
  describe("post-sign-in: anonymous work has empty messages", () => {
    test("falls through to existing-project lookup when messages array is empty", async () => {
      (getAnonWorkData as any).mockReturnValue({
        messages: [],
        fileSystemData: ANON_FS_DATA,
      });
      const existing = makeProject("existing-1");
      (getProjects as any).mockResolvedValue([existing]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("a@b.com", "password");
      });

      // Should NOT have created a project from anon work
      expect(clearAnonWork).not.toHaveBeenCalled();
      // Should have navigated to the existing project instead
      expect(mockPush).toHaveBeenCalledWith("/existing-1");
    });
  });

  // -------------------------------------------------------------------------
  // Post-sign-in navigation – no anon work, existing projects
  // -------------------------------------------------------------------------
  describe("post-sign-in: no anonymous work, existing projects", () => {
    test("navigates to the most recent (first) project", async () => {
      const projects = [makeProject("recent"), makeProject("older")];
      (getProjects as any).mockResolvedValue(projects);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("a@b.com", "password");
      });

      expect(createProject).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/recent");
    });

    test("same navigation logic applies after signUp", async () => {
      const projects = [makeProject("recent-su")];
      (getProjects as any).mockResolvedValue(projects);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("new@b.com", "password");
      });

      expect(mockPush).toHaveBeenCalledWith("/recent-su");
    });
  });

  // -------------------------------------------------------------------------
  // Post-sign-in navigation – no anon work, no existing projects
  // -------------------------------------------------------------------------
  describe("post-sign-in: no anonymous work, no existing projects", () => {
    test("creates a new blank project and navigates to it via signIn", async () => {
      const newProj = makeProject("brand-new");
      (createProject as any).mockResolvedValue(newProj);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("a@b.com", "password");
      });

      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/brand-new");
    });

    test("creates a new blank project and navigates to it via signUp", async () => {
      const newProj = makeProject("brand-new-su");
      (createProject as any).mockResolvedValue(newProj);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("new@b.com", "password");
      });

      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/brand-new-su");
    });
  });

  // -------------------------------------------------------------------------
  // Post-sign-in navigation – getAnonWorkData returns null
  // -------------------------------------------------------------------------
  describe("post-sign-in: getAnonWorkData returns null", () => {
    test("skips anon-work path and checks for existing projects", async () => {
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([makeProject("fallback")]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("a@b.com", "password");
      });

      expect(clearAnonWork).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/fallback");
    });
  });
});
