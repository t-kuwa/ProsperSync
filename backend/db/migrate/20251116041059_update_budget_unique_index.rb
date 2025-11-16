class UpdateBudgetUniqueIndex < ActiveRecord::Migration[8.0]
  def up
    remove_index :budgets, name: :index_budgets_on_account_and_period

    add_column :budgets,
               :parent_budget_scope_id,
               :bigint,
               as: "IFNULL(parent_budget_id, 0)",
               stored: true,
               comment: "親予算が無い場合は0になる正規化カラム"

    add_index :budgets,
              %i[account_id category_id period_type period_year period_month parent_budget_scope_id],
              unique: true,
              name: :index_budgets_on_account_and_period
  end

  def down
    remove_index :budgets, name: :index_budgets_on_account_and_period
    remove_column :budgets, :parent_budget_scope_id

    add_index :budgets,
              %i[account_id category_id period_type period_year period_month],
              unique: true,
              name: :index_budgets_on_account_and_period
  end
end
