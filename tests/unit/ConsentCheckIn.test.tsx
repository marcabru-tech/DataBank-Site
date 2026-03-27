import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConsentCheckIn, ConsentPurpose } from "@/components/consent-engine/ConsentCheckIn";

const purposes: ConsentPurpose[] = [
  {
    id: "p1",
    dataCategory: "financial",
    purpose: "Análise de crédito",
    description: "Usamos seus dados financeiros para calcular seu score.",
    recipientId: "databank-internal",
    required: true,
  },
  {
    id: "p2",
    dataCategory: "behavioral",
    purpose: "Personalização de alertas",
    description: "Enviamos alertas baseados no seu comportamento financeiro.",
    recipientId: "databank-alerts",
  },
  {
    id: "p3",
    dataCategory: "identity",
    purpose: "Verificação KYC",
    description: "Verificamos sua identidade conforme regulação BACEN.",
    recipientId: "kyc-provider",
  },
];

describe("ConsentCheckIn", () => {
  it("renders all purpose items", () => {
    render(<ConsentCheckIn purposes={purposes} onSubmit={jest.fn()} />);
    expect(screen.getByText("Análise de crédito")).toBeInTheDocument();
    expect(screen.getByText("Personalização de alertas")).toBeInTheDocument();
    expect(screen.getByText("Verificação KYC")).toBeInTheDocument();
  });

  it("pre-checks required purposes", () => {
    render(<ConsentCheckIn purposes={purposes} onSubmit={jest.fn()} />);
    const checkboxes = screen.getAllByRole("checkbox");
    // p1 is required and should be checked
    expect(checkboxes[0]).toBeChecked();
    // p2 and p3 are optional and should be unchecked
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });

  it("disables required purpose checkbox", () => {
    render(<ConsentCheckIn purposes={purposes} onSubmit={jest.fn()} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeDisabled();
  });

  it("allows toggling optional purposes", () => {
    render(<ConsentCheckIn purposes={purposes} onSubmit={jest.fn()} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).not.toBeChecked();
  });

  it("calls onSubmit with only selected purposes", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<ConsentCheckIn purposes={purposes} onSubmit={onSubmit} />);

    // Check p3 (KYC)
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[2]);

    fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: "p1" }),
          expect.objectContaining({ id: "p3" }),
        ])
      );
    });
    // p2 not included
    expect(onSubmit.mock.calls[0][0]).not.toContainEqual(expect.objectContaining({ id: "p2" }));
  });

  it("shows success message after submission", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<ConsentCheckIn purposes={purposes} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));
    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
    expect(screen.getByRole("status")).toHaveTextContent(/salvas com sucesso/i);
  });

  it("disables submit button while submitting", async () => {
    let resolve!: () => void;
    const onSubmit = jest.fn(() => new Promise<void>((r) => (resolve = r)));
    render(<ConsentCheckIn purposes={purposes} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));
    await waitFor(() => expect(screen.getByRole("button")).toBeDisabled());
    resolve();
  });

  it("renders category labels for all known categories", () => {
    render(<ConsentCheckIn purposes={purposes} onSubmit={jest.fn()} />);
    expect(screen.getByText(/Dados Financeiros/)).toBeInTheDocument();
    expect(screen.getByText(/Comportamental/)).toBeInTheDocument();
    expect(screen.getByText(/Identidade/)).toBeInTheDocument();
  });
});
