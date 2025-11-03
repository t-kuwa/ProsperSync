class AddJoinedAtAndInvitedByToMemberships < ActiveRecord::Migration[8.0]
  def change
    unless column_exists?(:memberships, :joined_at)
      add_column :memberships, :joined_at, :datetime, null: true
    end

    unless column_exists?(:memberships, :invited_by_id)
      add_reference :memberships, :invited_by, null: true, foreign_key: { to_table: :users }
    end
  end
end
