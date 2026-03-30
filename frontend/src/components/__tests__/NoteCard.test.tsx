import { render, screen } from "@testing-library/react";
import { NoteCard } from "@/components/NoteCard";
import type { Note } from "@/lib/types";

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
    style?: React.CSSProperties;
  }) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

function buildNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 42,
    title: "My title",
    body: "Preview body",
    category: {
      id: 1,
      name: "Ideas",
      color: "#c97b84",
      bg_color: "#f5f0e8",
      note_count: 3,
    },
    created_at: new Date(2026, 0, 1).toISOString(),
    updated_at: new Date(2026, 2, 29, 9, 0, 0).toISOString(),
    ...overrides,
  };
}

describe("NoteCard", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 29, 12, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders title, body preview, category name, and relative date", () => {
    render(<NoteCard note={buildNote()} />);
    expect(screen.getByRole("heading", { name: "My title" })).toBeInTheDocument();
    expect(screen.getByText("Preview body")).toBeInTheDocument();
    expect(screen.getByText("Ideas")).toBeInTheDocument();
    expect(screen.getByText("today")).toBeInTheDocument();
  });

  it("links to /notes/{id}", () => {
    render(<NoteCard note={buildNote({ id: 99 })} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/notes/99");
  });

  it('shows "Untitled" when title is empty', () => {
    render(<NoteCard note={buildNote({ title: "" })} />);
    expect(screen.getByRole("heading", { name: "Untitled" })).toBeInTheDocument();
  });

  it("truncates body preview at 120 chars", () => {
    const longBody = "a".repeat(121);
    render(<NoteCard note={buildNote({ body: longBody })} />);
    expect(screen.getByText(`${"a".repeat(120)}…`)).toBeInTheDocument();
  });
});
