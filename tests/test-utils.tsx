import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { DemoUserProvider } from "@/components/providers/demo-user-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

/** Renders a component with the same providers the real app uses. */
export function renderWithProviders(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <DemoUserProvider>{ui}</DemoUserProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}
