class CreateBudgets < ActiveRecord::Migration[7.1]
  def change
    create_table :budgets do |t|
      t.references :account, null: false, foreign_key: true
      t.references :category, foreign_key: true
      t.integer :amount, null: false
      t.integer :period_type, null: false, default: 0
      t.integer :period_month
      t.integer :period_year, null: false
      t.string :name

      t.timestamps
    end

    add_index :budgets,
              %i[account_id category_id period_type period_year period_month],
              unique: true,
              name: :index_budgets_on_account_and_period
  end
end
