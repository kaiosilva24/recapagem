import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CashFlowManager from "./CashFlowManager";
import FixedCostsManager from "./FixedCostsManager";
import TireCostManager from "./TireCostManager";
import VariableCostsManager from "./VariableCostsManager";
import DefectiveTireSalesManager from "./DefectiveTireSalesManager";
import PresumedProfitManager from "./PresumedProfitManager";
import ResaleProductProfitManager from "./ResaleProductProfitManager";
import CashBalanceDashboard from "./CashBalanceDashboard";
import RawMaterialDashboard from "./RawMaterialDashboard";
import {
  useEmployees,
  useCustomers,
  useSuppliers,
  useFixedCosts,
  useVariableCosts,
  useCashFlow,
  useSalespeople,
  useMaterials,
  useStockItems,
  useProductionEntries,
  useProducts,
  useRecipes,
  useDefectiveTireSales,
  useCostSimulations,
  useWarrantyEntries,
  useResaleProducts,
} from "@/hooks/useDataPersistence";
import type { DefectiveTireSale } from "@/types/financial";

interface FinancialDashboardProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

const FinancialDashboard = ({
  onRefresh = () => {},
  isLoading = false,
}: FinancialDashboardProps) => {
  const [activeTab, setActiveTab] = useState("cashflow");

  // Use database hooks for financial data
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { customers, isLoading: customersLoading } = useCustomers();
  const { suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { materials, isLoading: materialsLoading } = useMaterials();
  const { stockItems, isLoading: stockItemsLoading } = useStockItems();
  const { productionEntries, isLoading: productionLoading } =
    useProductionEntries();
  const { products, isLoading: productsLoading } = useProducts();
  const { recipes, isLoading: recipesLoading } = useRecipes();

  // Use financial hooks
  const {
    fixedCosts,
    addFixedCost,
    updateFixedCost,
    isLoading: fixedCostsLoading,
  } = useFixedCosts();
  const {
    variableCosts,
    addVariableCost,
    updateVariableCost,
    isLoading: variableCostsLoading,
  } = useVariableCosts();
  const {
    cashFlowEntries,
    addCashFlowEntry,
    deleteCashFlowEntry,
    isLoading: cashFlowLoading,
  } = useCashFlow();
  const {
    salespeople,
    addSalesperson,
    updateSalesperson,
    isLoading: salespeopleLoading,
  } = useSalespeople();
  const {
    defectiveTireSales,
    addDefectiveTireSale,
    deleteDefectiveTireSale,
    refreshDefectiveTireSales,
    isLoading: defectiveTireSalesLoading,
  } = useDefectiveTireSales();
  const { warrantyEntries, isLoading: warrantyEntriesLoading } =
    useWarrantyEntries();
  const { resaleProducts, isLoading: resaleProductsLoading } =
    useResaleProducts();

  // Enhanced defective tire sale handler that ensures immediate UI update
  const handleAddDefectiveTireSale = async (
    saleData: Omit<DefectiveTireSale, "id" | "created_at">,
  ) => {
    console.log(
      "🏭 [FinancialDashboard] INICIANDO registro de venda de pneu defeituoso:",
      {
        ...saleData,
        sale_date_formatted: new Date(saleData.sale_date).toLocaleDateString(
          "pt-BR",
        ),
        timestamp: new Date().toISOString(),
      },
    );

    try {
      console.log("🔄 [FinancialDashboard] Chamando addDefectiveTireSale...");
      const result = await addDefectiveTireSale(saleData);

      if (!result) {
        throw new Error(
          "addDefectiveTireSale retornou null - falha no registro",
        );
      }

      console.log("✅ [FinancialDashboard] Venda registrada com SUCESSO:", {
        id: result.id,
        tire_name: result.tire_name,
        quantity: result.quantity,
        sale_value: result.sale_value,
        sale_date: result.sale_date,
        sale_date_formatted: new Date(result.sale_date).toLocaleDateString(
          "pt-BR",
        ),
        created_at: result.created_at,
      });

      // The hook already handles multiple refreshes, but we can add one more for safety
      console.log(
        "🔄 [FinancialDashboard] Adicionando refresh extra de segurança...",
      );

      setTimeout(async () => {
        try {
          await refreshDefectiveTireSales();
          console.log(
            "✅ [FinancialDashboard] Refresh extra de segurança concluído",
          );
        } catch (refreshError) {
          console.error(
            "❌ [FinancialDashboard] Erro no refresh extra:",
            refreshError,
          );
        }
      }, 2500);

      console.log(
        "🎉 [FinancialDashboard] PROCESSO COMPLETO - Venda registrada!",
      );
      return result;
    } catch (error) {
      console.error(
        "❌ [FinancialDashboard] ERRO CRÍTICO ao registrar venda:",
        {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          saleData,
        },
      );
      throw error;
    }
  };

  // Financial archive handlers
  const handleArchiveFixedCost = async (costId: string) => {
    const cost = fixedCosts.find((c) => c.id === costId);
    if (cost) {
      await updateFixedCost(costId, { archived: !cost.archived });
    }
  };

  const handleArchiveVariableCost = async (costId: string) => {
    const cost = variableCosts.find((c) => c.id === costId);
    if (cost) {
      await updateVariableCost(costId, { archived: !cost.archived });
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-green to-neon-blue flex items-center justify-center">
            <span className="text-white font-bold text-lg">💰</span>
          </div>
          Sistema Financeiro
        </h2>
        <p className="text-tire-300 mt-2">
          Controle completo das finanças da empresa
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 bg-factory-800/50 border border-tire-600/30">
          <TabsTrigger
            value="cashflow"
            className="text-tire-300 data-[state=active]:text-white data-[state=active]:bg-neon-green/20"
          >
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger
            value="cash-balance"
            className="text-tire-300 data-[state=active]:text-white data-[state=active]:bg-neon-blue/20"
          >
            Saldo de Caixa
          </TabsTrigger>
          <TabsTrigger
            value="raw-materials"
            className="text-tire-300 data-[state=active]:text-white data-[state=active]:bg-neon-purple/20"
          >
            Matéria-Prima
          </TabsTrigger>
          <TabsTrigger
            value="fixed-costs"
            className="text-tire-300 data-[state=active]:text-white data-[state=active]:bg-neon-green/20"
          >
            Custos Fixos
          </TabsTrigger>
          <TabsTrigger
            value="variable-costs"
            className="text-tire-300 data-[state=active]:text-white data-[state=active]:bg-neon-green/20"
          >
            Custos Variáveis
          </TabsTrigger>
          <TabsTrigger
            value="tire-cost"
            className="text-tire-300 data-[state=active]:text-white data-[state=active]:bg-neon-green/20"
          >
            Custo por Pneu
          </TabsTrigger>
          <TabsTrigger
            value="defective-tire-sales"
            className="text-tire-300 data-[state=active]:text-white data-[state=active]:bg-neon-green/20"
          >
            Venda Pneus com Defeito
          </TabsTrigger>
          <TabsTrigger
            value="presumed-profit"
            className="text-tire-300 data-[state=active]:text-white data-[state=active]:bg-neon-green/20"
          >
            Lucro Presumido
          </TabsTrigger>
          <TabsTrigger
            value="resale-product-profit"
            className="text-tire-300 data-[state=active]:text-white data-[state=active]:bg-neon-cyan/20"
          >
            Lucro Produto Revenda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cashflow">
          <CashFlowManager
            isLoading={
              cashFlowLoading ||
              employeesLoading ||
              suppliersLoading ||
              customersLoading ||
              fixedCostsLoading ||
              variableCostsLoading ||
              salespeopleLoading
            }
            cashFlowEntries={cashFlowEntries}
            employees={employees}
            suppliers={suppliers}
            customers={customers}
            fixedCosts={fixedCosts}
            variableCosts={variableCosts}
            salespeople={salespeople}
            onSubmit={addCashFlowEntry}
            onDelete={deleteCashFlowEntry}
          />
        </TabsContent>

        <TabsContent value="cash-balance">
          <CashBalanceDashboard
            cashFlowEntries={cashFlowEntries}
            isLoading={cashFlowLoading}
          />
        </TabsContent>

        <TabsContent value="raw-materials">
          <RawMaterialDashboard
            materials={materials}
            stockItems={stockItems}
            cashFlowEntries={cashFlowEntries}
            suppliers={suppliers}
            onStockUpdate={(
              itemId,
              itemType,
              quantity,
              operation,
              unitPrice,
            ) => {
              // This would need to be implemented in the parent component
              console.log("Stock update:", {
                itemId,
                itemType,
                quantity,
                operation,
                unitPrice,
              });
            }}
            onAddCashFlowEntry={addCashFlowEntry}
            isLoading={
              materialsLoading ||
              stockItemsLoading ||
              cashFlowLoading ||
              suppliersLoading
            }
          />
        </TabsContent>

        <TabsContent value="fixed-costs">
          <FixedCostsManager
            isLoading={fixedCostsLoading}
            fixedCosts={fixedCosts}
            onSubmit={addFixedCost}
            onArchive={handleArchiveFixedCost}
          />
        </TabsContent>

        <TabsContent value="variable-costs">
          <VariableCostsManager
            isLoading={variableCostsLoading}
            variableCosts={variableCosts}
            onSubmit={addVariableCost}
            onArchive={handleArchiveVariableCost}
          />
        </TabsContent>

        <TabsContent value="tire-cost">
          <TireCostManager
            isLoading={
              materialsLoading ||
              employeesLoading ||
              fixedCostsLoading ||
              variableCostsLoading ||
              stockItemsLoading ||
              productionLoading ||
              productsLoading ||
              cashFlowLoading ||
              recipesLoading ||
              defectiveTireSalesLoading ||
              warrantyEntriesLoading
            }
            materials={materials}
            employees={employees}
            fixedCosts={fixedCosts}
            variableCosts={variableCosts}
            stockItems={stockItems}
            productionEntries={productionEntries}
            products={products}
            cashFlowEntries={cashFlowEntries}
            recipes={recipes}
            defectiveTireSales={defectiveTireSales}
            warrantyEntries={warrantyEntries}
          />
        </TabsContent>

        <TabsContent value="defective-tire-sales">
          <DefectiveTireSalesManager
            isLoading={defectiveTireSalesLoading}
            defectiveTireSales={defectiveTireSales}
            onSubmit={handleAddDefectiveTireSale}
            onDelete={deleteDefectiveTireSale}
          />
        </TabsContent>

        <TabsContent value="presumed-profit">
          <PresumedProfitManager
            isLoading={
              materialsLoading ||
              employeesLoading ||
              fixedCostsLoading ||
              variableCostsLoading ||
              stockItemsLoading ||
              productionLoading ||
              productsLoading ||
              cashFlowLoading ||
              recipesLoading ||
              defectiveTireSalesLoading ||
              warrantyEntriesLoading
            }
            materials={materials}
            employees={employees}
            fixedCosts={fixedCosts}
            variableCosts={variableCosts}
            stockItems={stockItems}
            productionEntries={productionEntries}
            products={products}
            cashFlowEntries={cashFlowEntries}
            recipes={recipes}
            defectiveTireSales={defectiveTireSales}
            warrantyEntries={warrantyEntries}
          />
        </TabsContent>

        <TabsContent value="resale-product-profit">
          <ResaleProductProfitManager
            isLoading={
              cashFlowLoading || stockItemsLoading || resaleProductsLoading
            }
            cashFlowEntries={cashFlowEntries}
            stockItems={stockItems}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
