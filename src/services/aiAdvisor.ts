import { apiClient } from './api';

export const generateAdvisorPrompt = async (
  userQuery: string,
  localMetrics: { fifoValue: number; informalDebt: number }
) => {
  try {
    const { data: cloudMetrics } = await apiClient.get('/dashboard/merchant-health');

    const context = `
[MERCHANT OPERATIONAL CONTEXT]
- Store Gross Revenue: N$ ${cloudMetrics.gross_sales || 0}
- Gross Profit Margin: ${cloudMetrics.gross_margin || 0}%
- Settlement Rate: ${cloudMetrics.settlement_rate || 0}%
- FIFO Inventory Asset Value: N$ ${localMetrics.fifoValue}
- Outstanding Informal Customer Debt: N$ ${localMetrics.informalDebt}
- 7-Day Revenue Trend: ${JSON.stringify(cloudMetrics.sales_trends || [])}
- System Status: ${cloudMetrics.system_health || 'Healthy'}

[COMMERCIAL MANDATE]
Provide concise, actionable business recommendations for stock reorders, cash flow protection, and informal credit risk management.
`;

    return {
      systemInstruction: context,
      prompt: userQuery,
    };
  } catch (error) {
    // Fallback to local offline metrics if network is down
    return {
      systemInstruction: `FIFO Inventory Asset Value: N$ ${localMetrics.fifoValue}, Informal Debt: N$ ${localMetrics.informalDebt}`,
      prompt: userQuery,
    };
  }
};
