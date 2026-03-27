import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConsentCard, ConsentCardProps } from "@/components/consent-engine/ConsentCard";

const baseProps: ConsentCardProps = {
  id: "consent-1",
  dataCategory: "financial",
  purpose: "Análise de crédito",
  recipientId: "parceiro-abc",
  status: "active",
  grantedAt: "2024-01-15T10:00:00.000Z",
  expiresAt: "2025-01-15T10:00:00.000Z",
};

describe("ConsentCard", () => {
  it("renders category label, purpose and recipient", () => {
    render(<ConsentCard {...baseProps} />);
    expect(screen.getByText("Dados Financeiros")).toBeInTheDocument();
    expect(screen.getByText("Análise de crédito")).toBeInTheDocument();
    expect(screen.getByText(/parceiro-abc/)).toBeInTheDocument();
  });

  it("shows 'Ativo' badge for active consents", () => {
    render(<ConsentCard {...baseProps} />);
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("shows 'Revogado' badge for revoked consents", () => {
    render(<ConsentCard {...baseProps} status="revoked" />);
    expect(screen.getByText("Revogado")).toBeInTheDocument();
  });

  it("shows 'Expirado' badge for expired consents", () => {
    render(<ConsentCard {...baseProps} status="expired" />);
    expect(screen.getByText("Expirado")).toBeInTheDocument();
  });

  it("renders grant date and expiry date", () => {
    render(<ConsentCard {...baseProps} />);
    expect(screen.getByText(/Concedido em/)).toBeInTheDocument();
    expect(screen.getByText(/Expira em/)).toBeInTheDocument();
  });

  it("does not render expiry when expiresAt is null", () => {
    render(<ConsentCard {...baseProps} expiresAt={null} />);
    expect(screen.queryByText(/Expira em/)).not.toBeInTheDocument();
  });

  it("renders revoke button for active consent when onRevoke is provided", () => {
    const onRevoke = jest.fn();
    render(<ConsentCard {...baseProps} onRevoke={onRevoke} />);
    expect(screen.getByRole("button", { name: /Revogar consentimento/i })).toBeInTheDocument();
  });

  it("does not render revoke button when status is revoked", () => {
    const onRevoke = jest.fn();
    render(<ConsentCard {...baseProps} status="revoked" onRevoke={onRevoke} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onRevoke with the consent id when button is clicked", async () => {
    const onRevoke = jest.fn().mockResolvedValue(undefined);
    render(<ConsentCard {...baseProps} onRevoke={onRevoke} />);
    fireEvent.click(screen.getByRole("button", { name: /Revogar/i }));
    await waitFor(() => expect(onRevoke).toHaveBeenCalledWith("consent-1"));
  });

  it("disables revoke button while revoking", async () => {
    let resolve!: () => void;
    const onRevoke = jest.fn(() => new Promise<void>((r) => (resolve = r)));
    render(<ConsentCard {...baseProps} onRevoke={onRevoke} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByRole("button")).toBeDisabled());
    resolve();
  });

  it("renders fallback for unknown dataCategory", () => {
    render(<ConsentCard {...baseProps} dataCategory="unknown_cat" />);
    expect(screen.getByText("unknown_cat")).toBeInTheDocument();
  });
});
