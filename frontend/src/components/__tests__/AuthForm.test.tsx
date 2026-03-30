import { render, screen } from "@testing-library/react";
import { AuthForm } from "@/components/AuthForm";

jest.mock("next/link", () => ({
  __esModule: true,
  default({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

jest.mock("@/lib/auth", () => ({
  useAuth: () => ({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn().mockResolvedValue(undefined),
    signup: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn(),
  }),
}));

describe("AuthForm", () => {
  it('renders login heading "Yay, You\'re Back!"', () => {
    render(<AuthForm mode="login" />);
    expect(
      screen.getByRole("heading", { name: "Yay, You're Back!" })
    ).toBeInTheDocument();
  });

  it('renders signup heading "Yay, New Friend!"', () => {
    render(<AuthForm mode="signup" />);
    expect(
      screen.getByRole("heading", { name: "Yay, New Friend!" })
    ).toBeInTheDocument();
  });

  it('renders Login button label for login mode', () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it('renders Sign Up button label for signup mode', () => {
    render(<AuthForm mode="signup" />);
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("renders toggle link for login mode", () => {
    render(<AuthForm mode="login" />);
    const link = screen.getByRole("link", {
      name: "Oops! I've never been here before",
    });
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("renders toggle link for signup mode", () => {
    render(<AuthForm mode="signup" />);
    const link = screen.getByRole("link", { name: "We're already friends!" });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("has email and password inputs", () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });
});
