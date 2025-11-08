class ChangeInvitedByIdToNullableInMemberships < ActiveRecord::Migration[8.0]
  def change
    change_column_null :memberships, :invited_by_id, true
  end
end
