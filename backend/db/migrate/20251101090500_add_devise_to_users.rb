class AddDeviseToUsers < ActiveRecord::Migration[8.0]
  def change
    change_table :users, bulk: true do |t|
      t.string :encrypted_password, null: false, default: "" unless column_exists?(:users, :encrypted_password)
      t.string :reset_password_token
      t.datetime :reset_password_sent_at
      t.datetime :remember_created_at
    end

    add_index :users, :reset_password_token, unique: true
  end
end
