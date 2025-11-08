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

ActiveRecord::Schema[8.0].define(version: 2025_11_04_120000) do
  create_table "account_invitations", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", comment: "アカウント招待", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "inviter_id", null: false
    t.string "email", null: false, comment: "招待メールアドレス"
    t.integer "role", default: 1, null: false, comment: "付与する役割"
    t.string "token", null: false, comment: "招待トークン"
    t.datetime "expires_at", null: false, comment: "有効期限"
    t.datetime "accepted_at", comment: "承諾日時"
    t.datetime "revoked_at", comment: "失効日時"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_account_invitations_on_account_id"
    t.index ["inviter_id"], name: "index_account_invitations_on_inviter_id"
    t.index ["token"], name: "index_account_invitations_on_token", unique: true
  end

  create_table "accounts", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", comment: "ユーザーのグループアカウント", force: :cascade do |t|
    t.string "name", null: false, comment: "アカウント名"
    t.bigint "owner_id", null: false, comment: "オーナー"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "account_type", default: 0, null: false, comment: "アカウント種別 0:personal 1:team"
    t.string "slug", null: false, comment: "URL識別子"
    t.text "description", comment: "説明"
    t.index ["owner_id", "account_type"], name: "index_accounts_on_owner_and_personal_type", unique: true
    t.index ["owner_id"], name: "index_accounts_on_owner_id"
    t.index ["slug"], name: "index_accounts_on_slug", unique: true
  end

  create_table "expenses", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", comment: "支出", force: :cascade do |t|
    t.bigint "account_id", null: false, comment: "アカウント"
    t.bigint "user_id", null: false, comment: "ユーザー"
    t.string "title", null: false, comment: "カテゴリ"
    t.integer "amount", null: false, comment: "金額"
    t.date "spent_on", null: false, comment: "支出日"
    t.text "memo", comment: "メモ"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_expenses_on_account_id"
    t.index ["user_id"], name: "index_expenses_on_user_id"
  end

  create_table "incomes", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", comment: "収入", force: :cascade do |t|
    t.bigint "account_id", null: false, comment: "アカウント"
    t.bigint "user_id", null: false, comment: "ユーザー"
    t.string "title", null: false, comment: "カテゴリ"
    t.integer "amount", null: false, comment: "金額"
    t.date "received_on", null: false, comment: "収入日"
    t.text "memo", comment: "メモ"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_incomes_on_account_id"
    t.index ["user_id"], name: "index_incomes_on_user_id"
  end

  create_table "memberships", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", comment: "ユーザーのグループアカウントに所属するメンバー", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "role", default: 1, null: false, comment: "ロール (0: owner, 1: member)"
    t.datetime "joined_at"
    t.bigint "invited_by_id"
    t.datetime "left_at", comment: "離脱日時"
    t.index ["account_id", "user_id"], name: "index_memberships_on_account_id_and_user_id", unique: true
    t.index ["account_id"], name: "index_memberships_on_account_id"
    t.index ["invited_by_id"], name: "index_memberships_on_invited_by_id"
    t.index ["user_id"], name: "index_memberships_on_user_id"
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
    t.bigint "primary_account_id", comment: "個人用アカウント"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["primary_account_id"], name: "index_users_on_primary_account_id"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "account_invitations", "accounts"
  add_foreign_key "account_invitations", "users", column: "inviter_id"
  add_foreign_key "accounts", "users", column: "owner_id"
  add_foreign_key "expenses", "accounts"
  add_foreign_key "expenses", "users"
  add_foreign_key "incomes", "accounts"
  add_foreign_key "incomes", "users"
  add_foreign_key "memberships", "accounts"
  add_foreign_key "memberships", "users"
  add_foreign_key "users", "accounts", column: "primary_account_id"
end
