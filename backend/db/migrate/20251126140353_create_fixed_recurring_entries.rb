class CreateFixedRecurringEntries < ActiveRecord::Migration[8.0]
  def change
    create_table :fixed_recurring_entries do |t|
      t.references :account, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true
      t.string :title, null: false
      t.integer :kind, null: false, default: 0, comment: "expense or income"
      t.integer :amount, null: false
      t.integer :day_of_month, null: false
      t.boolean :use_end_of_month, null: false, default: false
      t.date :effective_from, null: false, comment: "有効開始月（月初）"
      t.date :effective_to, comment: "有効終了月（月初、未設定なら無期限）"
      t.text :memo

      t.timestamps
    end

    create_table :fixed_recurring_entry_occurrences do |t|
      t.references :fixed_recurring_entry, null: false, foreign_key: true, index: { name: "index_freo_on_entry_id" }
      t.date :period_month, null: false, comment: "対象月（必ず月初）"
      t.date :occurs_on, null: false, comment: "実際の発生日"
      t.integer :status, null: false, default: 0, comment: "scheduled/applied/canceled"
      t.datetime :applied_at, comment: "実績反映日時"

      t.timestamps
    end

    add_index :fixed_recurring_entry_occurrences,
              %i[fixed_recurring_entry_id period_month],
              unique: true,
              name: "index_freo_on_entry_id_and_period_month"
  end
end
