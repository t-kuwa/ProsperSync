class CreateCategories < ActiveRecord::Migration[8.0]
  def change
    create_table :categories, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", comment: "収支のカテゴリ" do |t|
      t.bigint :account_id, null: false, comment: "アカウント"
      t.string :name, null: false, comment: "カテゴリ名"
      t.integer :type, null: false, comment: "種別 0:expense 1:income"
      t.string :color, comment: "表示色（HEXコード）"
      t.string :icon, comment: "アイコン名"
      t.integer :position, default: 0, null: false, comment: "表示順序"
      t.timestamps
    end

    add_index :categories, [:account_id, :type, :name], unique: true, name: "index_categories_on_account_type_name"
    add_index :categories, :account_id
    add_foreign_key :categories, :accounts
  end
end
