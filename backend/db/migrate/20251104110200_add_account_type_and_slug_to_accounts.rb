require "securerandom"

class AddAccountTypeAndSlugToAccounts < ActiveRecord::Migration[8.0]
  class MigrationAccount < ApplicationRecord
    self.table_name = "accounts"
  end

  def up
    add_column :accounts, :account_type, :integer, null: false, default: 0, comment: "アカウント種別 0:personal 1:team" unless column_exists?(:accounts, :account_type)
    add_column :accounts, :slug, :string, comment: "URL識別子" unless column_exists?(:accounts, :slug)
    add_column :accounts, :description, :text, comment: "説明" unless column_exists?(:accounts, :description)

    MigrationAccount.reset_column_information

    MigrationAccount.find_each do |account|
      account.update_columns(
        slug: SecureRandom.uuid,
        account_type: account.account_type.presence || 0,
      )
    end

    change_column_null :accounts, :slug, false

    add_index :accounts, :slug, unique: true unless index_exists?(:accounts, :slug)
    unless index_exists?(:accounts, [:owner_id, :account_type], name: "index_accounts_on_owner_and_personal_type")
      add_index :accounts, [:owner_id, :account_type],
                unique: true,
                where: "account_type = 0",
                name: "index_accounts_on_owner_and_personal_type"
    end
  end

  def down
    remove_index :accounts, name: "index_accounts_on_owner_and_personal_type" if index_exists?(:accounts, [:owner_id, :account_type], name: "index_accounts_on_owner_and_personal_type")
    remove_index :accounts, :slug if index_exists?(:accounts, :slug)

    remove_column :accounts, :description, :text if column_exists?(:accounts, :description)
    remove_column :accounts, :slug, :string if column_exists?(:accounts, :slug)
    remove_column :accounts, :account_type, :integer if column_exists?(:accounts, :account_type)
  end
end
