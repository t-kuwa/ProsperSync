class CreateAccountInvitations < ActiveRecord::Migration[8.0]
  def change
    create_table :account_invitations, comment: "アカウント招待" do |t|
      t.references :account, null: false, foreign_key: true
      t.references :inviter, null: false, foreign_key: { to_table: :users }
      t.string :email, null: false, comment: "招待メールアドレス"
      t.integer :role, null: false, default: 1, comment: "付与する役割"
      t.string :token, null: false, comment: "招待トークン"
      t.datetime :expires_at, null: false, comment: "有効期限"
      t.datetime :accepted_at, comment: "承諾日時"
      t.datetime :revoked_at, comment: "失効日時"

      t.timestamps
    end

    add_index :account_invitations, :token, unique: true
  end
end
