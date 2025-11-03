class RenameMembersToMemberships < ActiveRecord::Migration[8.0]
  def change
    if table_exists?(:members) && !table_exists?(:memberships)
      rename_table :members, :memberships
    end

    return unless table_exists?(:memberships)

    if index_name_exists?(:memberships, "index_members_on_account_id_and_user_id")
      rename_index :memberships,
                   "index_members_on_account_id_and_user_id",
                   "index_memberships_on_account_id_and_user_id"
    elsif !index_name_exists?(:memberships, "index_memberships_on_account_id_and_user_id")
      add_index :memberships,
                %i[account_id user_id],
                unique: true,
                name: "index_memberships_on_account_id_and_user_id"
    end
  end
end
