class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users, comment: "ユーザー" do |t|
      t.string :name, null: false, comment: "名前"
      t.string :email, null: false, comment: "メールアドレス"
      t.string :password_digest, null: false, comment: "パスワードハッシュ"

      t.timestamps
    end

    add_index :users, :email, unique: true
  end
end
