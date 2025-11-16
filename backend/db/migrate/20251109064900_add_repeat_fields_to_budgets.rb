class AddRepeatFieldsToBudgets < ActiveRecord::Migration[7.1]
  def change
    add_column :budgets, :repeat_enabled, :boolean, default: false, null: false
    add_column :budgets, :repeat_until_date, :date
    add_reference :budgets, :parent_budget, foreign_key: { to_table: :budgets }
  end
end
