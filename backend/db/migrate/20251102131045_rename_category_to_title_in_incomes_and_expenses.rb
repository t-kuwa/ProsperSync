class RenameCategoryToTitleInIncomesAndExpenses < ActiveRecord::Migration[8.0]
  def change
    rename_column :incomes, :category, :title
    rename_column :expenses, :category, :title
  end
end
