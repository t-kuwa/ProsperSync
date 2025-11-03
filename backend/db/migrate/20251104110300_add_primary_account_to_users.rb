class AddPrimaryAccountToUsers < ActiveRecord::Migration[8.0]
  def change
    add_reference :users,
                  :primary_account,
                  foreign_key: { to_table: :accounts },
                  comment: "個人用アカウント" unless column_exists?(:users, :primary_account_id)
  end
end
