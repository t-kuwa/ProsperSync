class AddCategoryIdToExpenses < ActiveRecord::Migration[8.0]
  def up
    # 既存データがある場合のために、まずnullableで追加
    unless column_exists?(:expenses, :category_id)
      add_column :expenses, :category_id, :bigint, comment: "カテゴリ"
      add_index :expenses, :category_id
      add_foreign_key :expenses, :categories
    end

    # 既存データの移行: 各アカウントごとにデフォルトカテゴリを作成して関連付け
    Account.find_each do |account|
      default_category = account.categories.find_or_create_by!(
        name: "その他",
        type: :expense
      ) do |category|
        category.position = 0
      end

      account.expenses.where(category_id: nil).update_all(category_id: default_category.id)
    end

    # すべてのレコードにcategory_idが設定されたら、null: falseに変更
    if column_exists?(:expenses, :category_id)
      change_column_null :expenses, :category_id, false
    end
  end

  def down
    if column_exists?(:expenses, :category_id)
      remove_foreign_key :expenses, :categories
      remove_index :expenses, :category_id
      remove_column :expenses, :category_id
    end
  end
end
