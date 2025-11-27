class CreateInvoices < ActiveRecord::Migration[8.0]
  def change
    create_table :invoices do |t|
      t.references :issuer_account, null: false, foreign_key: { to_table: :accounts }
      t.references :payer_account, null: false, foreign_key: { to_table: :accounts }
      t.string :title, null: false
      t.text :description
      t.integer :amount_minor, null: false
      t.string :currency, null: false
      t.integer :status, null: false, default: 0, comment: "draft/issued/cancel_pending/canceled"
      t.date :issue_date
      t.date :due_date
      t.string :invoice_number
      t.json :issuer_contact
      t.json :payer_contact
      t.text :memo

      t.timestamps
    end

    add_index :invoices, [:issuer_account_id, :invoice_number], unique: true

    create_table :invoice_lines do |t|
      t.references :invoice, null: false, foreign_key: true
      t.string :description, null: false
      t.integer :quantity, null: false, default: 1
      t.integer :unit_price_minor, null: false
      t.integer :position

      t.timestamps
    end

    create_table :invoice_cancel_requests do |t|
      t.references :invoice, null: false, foreign_key: true
      t.references :requested_by, null: false, foreign_key: { to_table: :users }
      t.text :reason
      t.integer :status, null: false, default: 0, comment: "pending/approved/rejected"
      t.references :resolved_by, foreign_key: { to_table: :users }
      t.datetime :resolved_at

      t.timestamps
    end
  end
end
