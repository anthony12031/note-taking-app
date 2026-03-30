import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/EmptyState";

describe("EmptyState", () => {
  it("renders the waiting message", () => {
    render(<EmptyState />);
    expect(
      screen.getByText("I'm just here waiting for your charming notes...")
    ).toBeInTheDocument();
  });

  it("renders BubbleTeaIllustration", () => {
    const { container } = render(<EmptyState />);
    const svg = container.querySelector('svg[viewBox="0 0 120 120"]');
    expect(svg).toBeInTheDocument();
  });
});
