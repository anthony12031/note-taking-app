import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategorySidebar } from "@/components/CategorySidebar";
import type { Category } from "@/lib/types";

const categories: Category[] = [
  {
    id: 1,
    name: "Work",
    color: "#c97b84",
    bg_color: "#fff3e0",
    note_count: 4,
  },
  {
    id: 2,
    name: "Personal",
    color: "#5c7a5c",
    bg_color: "#f0f5f0",
    note_count: 2,
  },
];

describe("CategorySidebar", () => {
  it("renders all categories with colored dots and note counts", () => {
    render(
      <CategorySidebar
        categories={categories}
        selectedCategoryId="all"
        onSelectCategory={() => {}}
      />
    );
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    const dots = document.querySelectorAll("span.rounded-full.size-2\\.5");
    expect(dots).toHaveLength(2);
    expect(dots[0]).toHaveStyle({ backgroundColor: "#c97b84" });
    expect(dots[1]).toHaveStyle({ backgroundColor: "#5c7a5c" });
  });

  it('calls onSelectCategory("all") when All Categories is clicked', async () => {
    const user = userEvent.setup();
    const onSelectCategory = jest.fn();
    render(
      <CategorySidebar
        categories={categories}
        selectedCategoryId={1}
        onSelectCategory={onSelectCategory}
      />
    );
    await user.click(screen.getByRole("button", { name: "All Categories" }));
    expect(onSelectCategory).toHaveBeenCalledWith("all");
  });

  it("calls onSelectCategory with category id when a category is clicked", async () => {
    const user = userEvent.setup();
    const onSelectCategory = jest.fn();
    render(
      <CategorySidebar
        categories={categories}
        selectedCategoryId="all"
        onSelectCategory={onSelectCategory}
      />
    );
    await user.click(screen.getByRole("button", { name: /Work/ }));
    expect(onSelectCategory).toHaveBeenCalledWith(1);
  });

  it("applies highlight styling to the selected category", () => {
    const { rerender } = render(
      <CategorySidebar
        categories={categories}
        selectedCategoryId="all"
        onSelectCategory={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: "All Categories" })).toHaveClass(
      "text-[#3d3428]"
    );

    rerender(
      <CategorySidebar
        categories={categories}
        selectedCategoryId={1}
        onSelectCategory={() => {}}
      />
    );
    const workButton = screen.getByRole("button", { name: /Work/ });
    expect(workButton).toHaveClass("bg-[#fff3e0]");
    expect(workButton).toHaveClass("font-medium");
  });
});
