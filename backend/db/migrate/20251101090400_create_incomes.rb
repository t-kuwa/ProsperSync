class CreateIncomes < ActiveRecord::Migration[8.0]
  def change
    create_table :incomes, comment: "収入" do |t|
      t.references :account, null: false, foreign_key: true, comment: "アカウント"
      t.references :user, null: false, foreign_key: true, comment: "ユーザー"
      t.string :category, null: false, comment: "カテゴリ"
      t.integer :amount, null: false, comment: "金額"
      t.date :received_on, null: false, comment: "収入日"
      t.text :memo, comment: "メモ"

      t.timestamps
    end
  end
end
