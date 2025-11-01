class CreateExpenses < ActiveRecord::Migration[8.0]
  def change
    create_table :expenses, comment: "支出" do |t|
      t.references :account, null: false, foreign_key: true, comment: "アカウント"
      t.references :user, null: false, foreign_key: true, comment: "ユーザー"
      t.string :category, null: false, comment: "カテゴリ"
      t.integer :amount, null: false, comment: "金額"
      t.date :spent_on, null: false, comment: "支出日"
      t.text :memo, comment: "メモ"

      t.timestamps
    end
  end
end
