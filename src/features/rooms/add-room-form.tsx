import { addRoom } from "./actions";

export function AddRoomForm() {
  return (
    <form action={addRoom} className="flex items-center gap-2">
      <input
        name="name"
        required
        maxLength={40}
        placeholder="New room"
        aria-label="New room name"
        className="w-36 rounded-full border border-line bg-card px-3.5 py-1.5 text-sm outline-none placeholder:text-soft focus:border-ink"
      />
      <button
        type="submit"
        className="rounded-full border border-line px-3.5 py-1.5 text-sm hover:bg-card"
      >
        Add
      </button>
    </form>
  );
}
