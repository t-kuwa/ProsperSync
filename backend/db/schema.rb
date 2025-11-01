# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_11_01_090600) do
  create_table "accounts", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", comment: "ユーザーのグループアカウント", force: :cascade do |t|
    t.string "name", null: false, comment: "アカウント名"
    t.bigint "owner_id", null: false, comment: "オーナー"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["owner_id"], name: "index_accounts_on_owner_id"
  end

  create_table "expenses", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "user_id", null: false
    t.string "category", null: false
    t.integer "amount", null: false
    t.date "spent_on", null: false
    t.text "memo"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_expenses_on_account_id"
    t.index ["user_id"], name: "index_expenses_on_user_id"
  end

  create_table "incomes", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", comment: "収入", force: :cascade do |t|
    t.bigint "account_id", null: false, comment: "アカウント"
    t.bigint "user_id", null: false, comment: "ユーザー"
    t.string "category", null: false, comment: "カテゴリ"
    t.integer "amount", null: false, comment: "金額"
    t.date "received_on", null: false, comment: "収入日"
    t.text "memo", comment: "メモ"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_incomes_on_account_id"
    t.index ["user_id"], name: "index_incomes_on_user_id"
  end

  create_table "members", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", comment: "ユーザーのグループアカウントに所属するメンバー", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "user_id", null: false
    t.string "role", default: "member", null: false, comment: "ロール"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "user_id"], name: "index_members_on_account_id_and_user_id", unique: true
    t.index ["account_id"], name: "index_members_on_account_id"
    t.index ["user_id"], name: "index_members_on_user_id"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", comment: "ユーザー", force: :cascade do |t|
    t.string "name", null: false, comment: "名前"
    t.string "email", null: false, comment: "メールアドレス"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "accounts", "users", column: "owner_id"
  add_foreign_key "expenses", "accounts"
  add_foreign_key "expenses", "users"
  add_foreign_key "incomes", "accounts"
  add_foreign_key "incomes", "users"
  add_foreign_key "members", "accounts"
  add_foreign_key "members", "users"
end
