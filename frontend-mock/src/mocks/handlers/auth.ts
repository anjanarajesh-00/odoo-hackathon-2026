import { http, HttpResponse } from "msw";
import { getStoredUsers, saveStoredUsers, type MockUser } from "../db";

function isWeakPassword(pwd: string): boolean {
  if (pwd.length < 9) return true;
  if (!/[A-Z]/.test(pwd)) return true;
  if (!/[a-z]/.test(pwd)) return true;
  if (!/[^A-Za-z0-9]/.test(pwd)) return true;
  return false;
}

export const authHandlers = [
  // POST /auth/login
  http.post("*/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    const users = getStoredUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === (body.email || "").toLowerCase()
    );

    // Realistic 401 for bad password or user not found
    if (!user || user.password !== body.password) {
      return HttpResponse.json(
        {
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const token = `mock_jwt_token_${user.id}_${user.role}_${Date.now()}`;
    return HttpResponse.json({
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          customerId: user.customerId,
        },
      },
    });
  }),

  // GET /auth/me
  http.get("*/auth/me", ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { message: "Unauthenticated" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const parts = token.split("_");
    const userId = parts[3];

    const users = getStoredUsers();
    const user = users.find((u) => u.id === userId) || users[0];

    return HttpResponse.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        customerId: user.customerId,
      },
    });
  }),

  // POST /auth/signup
  http.post("*/auth/signup", async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      email: string;
      company?: string;
      password?: string;
    };

    const users = getStoredUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === (body.email || "").toLowerCase()
    );

    // 409 Conflict if email is already registered
    if (existing) {
      return HttpResponse.json(
        {
          message: "Email already registered",
          errors: {
            email: "Email already registered",
          },
        },
        { status: 409 }
      );
    }

    // 422 if password does not satisfy strength rule
    if (!body.password || isWeakPassword(body.password)) {
      return HttpResponse.json(
        {
          message: "Password does not meet security requirements",
          errors: {
            password: "Must be > 8 characters with uppercase, lowercase, and special character",
          },
        },
        { status: 422 }
      );
    }

    const newUser: MockUser = {
      id: `usr_${Date.now()}`,
      name: body.name,
      email: body.email,
      role: "customer",
      customerId: `cust_${Date.now()}`,
      password: body.password,
    };

    users.push(newUser);
    saveStoredUsers(users);

    const token = `mock_jwt_token_${newUser.id}_customer_${Date.now()}`;

    // Return token + user so useSignup can log the user straight in
    return HttpResponse.json(
      {
        data: {
          token,
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            customerId: newUser.customerId,
          },
        },
      },
      { status: 201 }
    );
  }),

  // POST /auth/forgot-password
  http.post("*/auth/forgot-password", async ({ request }) => {
    await request.json();
    // Always return generic 200 to prevent account enumeration
    return HttpResponse.json({
      message: "If that email is registered, a reset link has been sent",
    });
  }),

  // POST /auth/reset-password
  http.post("*/auth/reset-password", async ({ request }) => {
    const body = (await request.json()) as { token: string; password: string };

    if (body.token === "invalid" || !body.token) {
      return HttpResponse.json(
        { message: "The reset token is invalid or has expired." },
        { status: 400 }
      );
    }

    if (!body.password || isWeakPassword(body.password)) {
      return HttpResponse.json(
        {
          message: "Password does not meet security requirements",
          errors: {
            password: "Must be > 8 characters with uppercase, lowercase, and special character",
          },
        },
        { status: 422 }
      );
    }

    return HttpResponse.json({
      message: "Password has been successfully reset",
    });
  }),

  // POST /auth/logout
  http.post("*/auth/logout", () => {
    return HttpResponse.json({
      message: "Logged out successfully",
    });
  }),
];
