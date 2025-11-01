class CreateMembers < ActiveRecord::Migration[8.0]
  def change
    create_table :members, comment: "ユーザーのグループアカウントに所属するメンバー" do |t|
      t.references :account, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :role, null: false, default: "member", comment: "ロール"

      t.timestamps
    end

    add_index :members, [:account_id, :user_id], unique: true
  end
end
