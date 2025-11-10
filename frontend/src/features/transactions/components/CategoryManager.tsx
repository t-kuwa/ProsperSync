import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import type {
  Category,
  CategoryPayload,
  CategoryType,
} from "../types";

type CategoryManagerProps = {
  categories: Category[];
  loading: boolean;
  processing: boolean;
  error: string | null;
  onCreate: (payload: CategoryPayload) => Promise<void>;
  onUpdate: (categoryId: number, payload: CategoryPayload) => Promise<void>;
  onDelete: (categoryId: number) => Promise<void>;
  onRefresh: () => Promise<void>;
};

export type CategoryManagerHandle = {
  openCreateModal: (type: CategoryType) => void;
};

type ModalState =
  | { open: false }
  | {
      open: true;
      mode: "create";
      type: CategoryType;
    }
  | {
      open: true;
      mode: "edit";
      type: CategoryType;
      category: Category;
    };

const DEFAULT_MODAL_STATE: ModalState = { open: false };

const CategoryManager = forwardRef<CategoryManagerHandle, CategoryManagerProps>(
  (
    {
      categories,
      loading,
      processing,
      error,
      onCreate,
      onUpdate,
      onDelete,
      onRefresh,
    },
    ref,
  ) => {
    const [activeType, setActiveType] = useState<CategoryType>("expense");
    const [modalState, setModalState] = useState<ModalState>(DEFAULT_MODAL_STATE);

    const openCreateModal = useCallback((type: CategoryType) => {
      setModalState({ open: true, mode: "create", type });
    }, []);

    const openEditModal = (category: Category) => {
      setModalState({
        open: true,
        mode: "edit",
        category,
        type: category.type,
      });
    };

    useImperativeHandle(
      ref,
      () => ({
        openCreateModal: (type: CategoryType) => {
          setActiveType(type);
          openCreateModal(type);
        },
      }),
      [openCreateModal],
    );

    const closeModal = useCallback(() => {
      setModalState(DEFAULT_MODAL_STATE);
    }, []);

    const handleSubmit = useCallback(
      async (payload: CategoryPayload, categoryId?: number) => {
        if (modalState.open && modalState.mode === "edit" && categoryId) {
          await onUpdate(categoryId, payload);
        } else {
          await onCreate(payload);
        }
        closeModal();
      },
      [modalState, onCreate, onUpdate, closeModal],
    );

    const handleDelete = async (category: Category) => {
      if (
        window.confirm(`カテゴリ「${category.name}」を削除しますか？`)
      ) {
        await onDelete(category.id);
      }
    };

    const filteredCategories = useMemo(
      () => categories.filter((category) => category.type === activeType),
      [categories, activeType],
    );

    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              カテゴリマネージャー
            </h3>
          </div>
          <div className="flex gap-2 text-xs font-semibold">
            <button
              type="button"
              className={`whitespace-nowrap rounded-full px-3 py-1 ${
                activeType === "expense"
                  ? "bg-rose-100 text-rose-700"
                  : "text-slate-500 hover:text-rose-600"
              }`}
              onClick={() => setActiveType("expense")}
            >
              支出
            </button>
            <button
              type="button"
              className={`whitespace-nowrap rounded-full px-3 py-1 ${
                activeType === "income"
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-slate-500 hover:text-emerald-600"
              }`}
              onClick={() => setActiveType("income")}
            >
              収入
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            onClick={() => openCreateModal(activeType)}
            disabled={processing}
          >
            新しいカテゴリを追加
          </button>
          <button
            type="button"
            className="text-xs font-semibold text-slate-500 underline-offset-4 hover:underline"
            onClick={onRefresh}
            disabled={loading}
          >
            再読み込み
          </button>
        </div>

        {error ? (
          <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </p>
        ) : null}

        <div className="mt-4 space-y-2">
          {loading ? (
            <p className="text-sm text-slate-400">読み込み中です…</p>
          ) : filteredCategories.length === 0 ? (
            <p className="text-sm text-slate-400">
              {activeType === "expense"
                ? "支出カテゴリがまだありません。"
                : "収入カテゴリがまだありません。"}
            </p>
          ) : (
            filteredCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: category.color ?? "#cbd5f5",
                    }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {category.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {category.icon ?? "アイコン未設定"}・優先度{" "}
                      {category.position}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    className="rounded-full px-3 py-1 text-indigo-600 hover:bg-indigo-50"
                    onClick={() => openEditModal(category)}
                    disabled={processing}
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    className="rounded-full px-3 py-1 text-rose-600 hover:bg-rose-50"
                    onClick={() => handleDelete(category)}
                    disabled={processing}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {modalState.open ? (
          <CategoryModal
            state={modalState}
            onClose={closeModal}
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>
    );
  },
);

CategoryManager.displayName = "CategoryManager";

type CategoryModalProps = {
  state: Exclude<ModalState, { open: false }>;
  onClose: () => void;
  onSubmit: (payload: CategoryPayload, categoryId?: number) => Promise<void>;
};

const CategoryModal = ({ state, onClose, onSubmit }: CategoryModalProps) => {
  const [name, setName] = useState(
    state.mode === "edit" ? state.category.name : "",
  );
  const [color, setColor] = useState(
    state.mode === "edit" ? state.category.color ?? "#94a3b8" : "#94a3b8",
  );
  const [icon, setIcon] = useState(
    state.mode === "edit" ? state.category.icon ?? "" : "",
  );
  const [position, setPosition] = useState(
    state.mode === "edit" ? state.category.position : 0,
  );
  const [type, setType] = useState<CategoryType>(state.type);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setName(state.mode === "edit" ? state.category.name : "");
    setColor(
      state.mode === "edit" ? state.category.color ?? "#94a3b8" : "#94a3b8",
    );
    setIcon(state.mode === "edit" ? state.category.icon ?? "" : "");
    setPosition(state.mode === "edit" ? state.category.position : 0);
    setType(state.type);
  }, [state]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(
        {
          name: name.trim(),
          type,
          color,
          icon: icon.trim() || null,
          position,
        },
        state.mode === "edit" ? state.category.id : undefined,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-slate-900">
              {state.mode === "edit" ? "カテゴリを編集" : "カテゴリを作成"}
            </h4>
            <p className="text-sm text-slate-500">
              種別: {type === "income" ? "収入" : "支出"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          {state.mode === "create" ? (
            <div className="flex gap-2">
              {(["expense", "income"] as const).map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setType(option)}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                    type === option
                      ? option === "income"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {option === "income" ? "収入" : "支出"}
                </button>
              ))}
            </div>
          ) : null}

          <div>
            <label className="text-sm font-medium text-slate-600">
              カテゴリ名
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-600">
                表示色
              </label>
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-600">
                アイコン（任意）
              </label>
              <input
                value={icon}
                onChange={(event) => setIcon(event.target.value)}
                placeholder="例: restaurant"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">
              表示順（0から）
            </label>
            <input
              type="number"
              value={position}
              onChange={(event) =>
                setPosition(Number(event.target.value) || 0)
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              disabled={submitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                submitting ? "bg-slate-300" : "bg-indigo-600 hover:bg-indigo-500"
              }`}
            >
              {state.mode === "edit" ? "更新する" : "作成する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryManager;
