import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConsentDashboard } from "@/components/consent-engine/ConsentDashboard";
import { ConsentCardProps } from "@/components/consent-engine/ConsentCard";

const mockConsents: ConsentCardProps[] = [
  {
    id: "c1",
    dataCategory: "financial",
    purpose: "Análise de crédito",
    recipientId: "parceiro-a",
    status: "active",
    grantedAt: "2024-06-01T00:00:00.000Z",
  },
  {
    id: "c2",
    dataCategory: "identity",
    purpose: "Verificação KYC",
    recipientId: "kyc-provider",
    status: "revoked",
    grantedAt: "2024-05-01T00:00:00.000Z",
  },
];

describe("ConsentDashboard", () => {
  it("shows loading state initially", () => {
    // fetcher that never resolves
    const fetcher = () => new Promise<ConsentCardProps[]>(() => {});
    render(<ConsentDashboard fetcher={fetcher} />);
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it("renders consent cards after loading", async () => {
    const fetcher = jest.fn().mockResolvedValue(mockConsents);
    render(<ConsentDashboard fetcher={fetcher} />);
    await waitFor(() => expect(screen.getAllByTestId("consent-card")).toHaveLength(2));
    expect(screen.getByText("Análise de crédito")).toBeInTheDocument();
    expect(screen.getByText("Verificação KYC")).toBeInTheDocument();
  });

  it("shows empty state when no consents", async () => {
    const fetcher = jest.fn().mockResolvedValue([]);
    render(<ConsentDashboard fetcher={fetcher} />);
    await waitFor(() =>
      expect(screen.getByText(/Nenhum consentimento encontrado/i)).toBeInTheDocument()
    );
  });

  it("shows error message on fetch failure", async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error("Falha ao carregar consentimentos"));
    render(<ConsentDashboard fetcher={fetcher} />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByRole("alert")).toHaveTextContent("Falha ao carregar consentimentos");
  });

  it("renders filter buttons", async () => {
    const fetcher = jest.fn().mockResolvedValue(mockConsents);
    render(<ConsentDashboard fetcher={fetcher} />);
    await waitFor(() => expect(screen.getAllByTestId("consent-card")).toHaveLength(2));
    expect(screen.getByRole("button", { name: /Todos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ativos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Revogados/i })).toBeInTheDocument();
  });

  it("renders export button", async () => {
    const fetcher = jest.fn().mockResolvedValue(mockConsents);
    render(<ConsentDashboard fetcher={fetcher} />);
    await waitFor(() => expect(screen.getAllByTestId("consent-card")).toHaveLength(2));
    expect(screen.getByText(/Exportar meus dados/i)).toBeInTheDocument();
  });

  it("marks active filter button as pressed", async () => {
    const fetcher = jest.fn().mockResolvedValue(mockConsents);
    render(<ConsentDashboard fetcher={fetcher} />);
    await waitFor(() => expect(screen.getAllByTestId("consent-card")).toHaveLength(2));
    const todosBtn = screen.getByRole("button", { name: /Todos/i });
    expect(todosBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("changes active filter when button is clicked", async () => {
    const fetcher = jest.fn().mockResolvedValue(mockConsents);
    render(<ConsentDashboard fetcher={fetcher} />);
    await waitFor(() => expect(screen.getAllByTestId("consent-card")).toHaveLength(2));
    const ativosBtn = screen.getByRole("button", { name: /Ativos/i });
    fireEvent.click(ativosBtn);
    expect(ativosBtn).toHaveAttribute("aria-pressed", "true");
  });
});
