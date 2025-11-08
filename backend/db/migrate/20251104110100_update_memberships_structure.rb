class UpdateMembershipsStructure < ActiveRecord::Migration[8.0]
  class MigrationMembership < ApplicationRecord
    self.table_name = "memberships"
  end

  def up
    convert_role_column

    add_column :memberships, :joined_at, :datetime, comment: "参加日時" unless column_exists?(:memberships, :joined_at)
    add_column :memberships, :left_at, :datetime, comment: "離脱日時" unless column_exists?(:memberships, :left_at)

    unless column_exists?(:memberships, :invited_by_id)
      add_reference :memberships, :invited_by, foreign_key: { to_table: :users }, comment: "招待したユーザー"
    end

    if column_exists?(:memberships, :joined_at)
      MigrationMembership.reset_column_information
      MigrationMembership.where(joined_at: nil).update_all(joined_at: Time.current)
    end
  end

  def down
    revert_role_column

    remove_reference :memberships, :invited_by, foreign_key: { to_table: :users } if column_exists?(:memberships, :invited_by_id)
    remove_column :memberships, :left_at, :datetime if column_exists?(:memberships, :left_at)
    remove_column :memberships, :joined_at, :datetime if column_exists?(:memberships, :joined_at)
  end

  private

  def convert_role_column
    if column_exists?(:memberships, :role, :integer)
      ensure_role_constraints
      return
    end

    add_column :memberships, :role_tmp, :integer, default: 1, null: false, comment: "ロール (0: owner, 1: member)" unless column_exists?(:memberships, :role_tmp)

    if column_exists?(:memberships, :role, :string)
      execute <<~SQL.squish
        UPDATE memberships
        SET role_tmp = CASE role WHEN 'owner' THEN 0 ELSE 1 END
      SQL

      remove_column :memberships, :role, :string
    end

    rename_column :memberships, :role_tmp, :role if column_exists?(:memberships, :role_tmp)
    ensure_role_constraints
  end

  def ensure_role_constraints
    change_column_default :memberships, :role, 1 if column_exists?(:memberships, :role)
    change_column_null :memberships, :role, false if column_exists?(:memberships, :role)
  end

  def revert_role_column
    return unless column_exists?(:memberships, :role, :integer)

    add_column :memberships, :role_tmp, :string, default: "member", null: false, comment: "ロール" unless column_exists?(:memberships, :role_tmp)

    execute <<~SQL.squish
      UPDATE memberships
      SET role_tmp = CASE role WHEN 0 THEN 'owner' ELSE 'member' END
    SQL

    remove_column :memberships, :role, :integer
    rename_column :memberships, :role_tmp, :role
  end
end
