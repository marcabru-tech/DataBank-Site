import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CTAForm from "@/components/CTAForm";

global.fetch = jest.fn();

describe("CTAForm", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it("renders the form fields", () => {
    render(<CTAForm />);
    expect(screen.getByPlaceholderText("Seu nome")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("E-mail corporativo")).toBeInTheDocument();
  });

  it("shows success message on successful submission", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    render(<CTAForm />);

    fireEvent.change(screen.getByPlaceholderText("Seu nome"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("E-mail corporativo"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByText("Solicitar acesso"));

    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
  });

  it("shows error message on failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    render(<CTAForm />);

    fireEvent.change(screen.getByPlaceholderText("Seu nome"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("E-mail corporativo"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByText("Solicitar acesso"));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });
});
