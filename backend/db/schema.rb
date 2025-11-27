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

ActiveRecord::Schema[8.0].define(version: 2025_11_27_132851) do
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

  create_table "budgets", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "category_id"
    t.integer "amount", null: false
    t.integer "period_type", default: 0, null: false
    t.integer "period_month"
    t.integer "period_year", null: false
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "repeat_enabled", default: false, null: false
    t.date "repeat_until_date"
    t.bigint "parent_budget_id"
    t.virtual "parent_budget_scope_id", type: :bigint, comment: "親予算が無い場合は0になる正規化カラム", as: "ifnull(`parent_budget_id`,0)", stored: true
    t.index ["account_id", "category_id", "period_type", "period_year", "period_month", "parent_budget_scope_id"], name: "index_budgets_on_account_and_period", unique: true
    t.index ["account_id"], name: "index_budgets_on_account_id"
    t.index ["category_id"], name: "index_budgets_on_category_id"
    t.index ["parent_budget_id"], name: "index_budgets_on_parent_budget_id"
  end

  create_table "categories", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", comment: "収支のカテゴリ", force: :cascade do |t|
    t.bigint "account_id", null: false, comment: "アカウント"
    t.string "name", null: false, comment: "カテゴリ名"
    t.integer "type", null: false, comment: "種別 0:expense 1:income"
    t.string "color", comment: "表示色（HEXコード）"
    t.string "icon", comment: "アイコン名"
    t.integer "position", default: 0, null: false, comment: "表示順序"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "type", "name"], name: "index_categories_on_account_type_name", unique: true
    t.index ["account_id"], name: "index_categories_on_account_id"
  end

  create_table "expenses", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", comment: "支出", force: :cascade do |t|
    t.bigint "account_id", null: false, comment: "アカウント"
    t.bigint "user_id", null: false, comment: "ユーザー"
    t.string "title", null: false, comment: "支出の内容"
    t.integer "amount", null: false, comment: "金額"
    t.date "spent_on", null: false, comment: "支出日"
    t.text "memo", comment: "メモ"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "category_id", null: false, comment: "カテゴリ"
    t.index ["account_id"], name: "index_expenses_on_account_id"
    t.index ["category_id"], name: "index_expenses_on_category_id"
    t.index ["user_id"], name: "index_expenses_on_user_id"
  end

  create_table "fixed_recurring_entries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "category_id", null: false
    t.string "title", null: false
    t.integer "kind", default: 0, null: false, comment: "expense or income"
    t.integer "amount", null: false
    t.integer "day_of_month", null: false
    t.boolean "use_end_of_month", default: false, null: false
    t.date "effective_from", null: false, comment: "有効開始月（月初）"
    t.date "effective_to", comment: "有効終了月（月初、未設定なら無期限）"
    t.text "memo"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_fixed_recurring_entries_on_account_id"
    t.index ["category_id"], name: "index_fixed_recurring_entries_on_category_id"
  end

  create_table "fixed_recurring_entry_occurrences", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "fixed_recurring_entry_id", null: false
    t.date "period_month", null: false, comment: "対象月（必ず月初）"
    t.date "occurs_on", null: false, comment: "実際の発生日"
    t.integer "status", default: 0, null: false, comment: "scheduled/applied/canceled"
    t.datetime "applied_at", comment: "実績反映日時"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "income_id"
    t.bigint "expense_id"
    t.index ["expense_id"], name: "index_fixed_recurring_entry_occurrences_on_expense_id"
    t.index ["fixed_recurring_entry_id", "period_month"], name: "index_freo_on_entry_id_and_period_month", unique: true
    t.index ["fixed_recurring_entry_id"], name: "index_freo_on_entry_id"
    t.index ["income_id"], name: "index_fixed_recurring_entry_occurrences_on_income_id"
  end

  create_table "incomes", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", comment: "収入", force: :cascade do |t|
    t.bigint "account_id", null: false, comment: "アカウント"
    t.bigint "user_id", null: false, comment: "ユーザー"
    t.string "title", null: false, comment: "収入の内容"
    t.integer "amount", null: false, comment: "金額"
    t.date "received_on", null: false, comment: "収入日"
    t.text "memo", comment: "メモ"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "category_id", null: false, comment: "カテゴリ"
    t.index ["account_id"], name: "index_incomes_on_account_id"
    t.index ["category_id"], name: "index_incomes_on_category_id"
    t.index ["user_id"], name: "index_incomes_on_user_id"
  end

  create_table "invoice_cancel_requests", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "invoice_id", null: false
    t.bigint "requested_by_id", null: false
    t.text "reason"
    t.integer "status", default: 0, null: false, comment: "pending/approved/rejected"
    t.bigint "resolved_by_id"
    t.datetime "resolved_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["invoice_id"], name: "index_invoice_cancel_requests_on_invoice_id"
    t.index ["requested_by_id"], name: "index_invoice_cancel_requests_on_requested_by_id"
    t.index ["resolved_by_id"], name: "index_invoice_cancel_requests_on_resolved_by_id"
  end

  create_table "invoice_lines", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "invoice_id", null: false
    t.string "description", null: false
    t.integer "quantity", default: 1, null: false
    t.integer "unit_price_minor", null: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["invoice_id"], name: "index_invoice_lines_on_invoice_id"
  end

  create_table "invoices", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "issuer_account_id", null: false
    t.bigint "payer_account_id", null: false
    t.string "title", null: false
    t.text "description"
    t.integer "amount_minor", null: false
    t.string "currency", null: false
    t.integer "status", default: 0, null: false, comment: "draft/issued/cancel_pending/canceled"
    t.date "issue_date"
    t.date "due_date"
    t.string "invoice_number"
    t.json "issuer_contact"
    t.json "payer_contact"
    t.text "memo"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["issuer_account_id", "invoice_number"], name: "index_invoices_on_issuer_account_id_and_invoice_number", unique: true
    t.index ["issuer_account_id"], name: "index_invoices_on_issuer_account_id"
    t.index ["payer_account_id"], name: "index_invoices_on_payer_account_id"
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
  add_foreign_key "budgets", "accounts"
  add_foreign_key "budgets", "budgets", column: "parent_budget_id"
  add_foreign_key "budgets", "categories"
  add_foreign_key "categories", "accounts"
  add_foreign_key "expenses", "accounts"
  add_foreign_key "expenses", "categories"
  add_foreign_key "expenses", "users"
  add_foreign_key "fixed_recurring_entries", "accounts"
  add_foreign_key "fixed_recurring_entries", "categories"
  add_foreign_key "fixed_recurring_entry_occurrences", "expenses"
  add_foreign_key "fixed_recurring_entry_occurrences", "fixed_recurring_entries"
  add_foreign_key "fixed_recurring_entry_occurrences", "incomes"
  add_foreign_key "incomes", "accounts"
  add_foreign_key "incomes", "categories"
  add_foreign_key "incomes", "users"
  add_foreign_key "invoice_cancel_requests", "invoices"
  add_foreign_key "invoice_cancel_requests", "users", column: "requested_by_id"
  add_foreign_key "invoice_cancel_requests", "users", column: "resolved_by_id"
  add_foreign_key "invoice_lines", "invoices"
  add_foreign_key "invoices", "accounts", column: "issuer_account_id"
  add_foreign_key "invoices", "accounts", column: "payer_account_id"
  add_foreign_key "memberships", "accounts"
  add_foreign_key "memberships", "users"
  add_foreign_key "users", "accounts", column: "primary_account_id"
end
