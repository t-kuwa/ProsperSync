class BackfillMembershipsRoleAndValidate < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def up
    execute "UPDATE memberships SET role = 1 WHERE role IS NULL"
    change_column_default :memberships, :role, 1
    change_column_null :memberships, :role, false
  end

  def down
    change_column_null :memberships, :role, true
    change_column_default :memberships, :role, nil
  end
end