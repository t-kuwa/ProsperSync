class CreateAccounts < ActiveRecord::Migration[8.0]
  def change
    create_table :accounts, comment: "ユーザーのグループアカウント" do |t|
      t.string :name, null: false, comment: "アカウント名"
      t.references :owner, null: false, foreign_key: { to_table: :users }, comment: "オーナー"

      t.timestamps
    end
  end
end
