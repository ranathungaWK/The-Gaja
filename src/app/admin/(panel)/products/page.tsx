import { getProducts } from "@/lib/data";
import { createProduct, moveProductImage, removeProductImage, saveProduct } from "../../actions";
import styles from "../admin.module.css";

export default async function AdminProducts() {
  const products = await getProducts({ includeInactive: true });

  return (
    <>
      <p className={styles.muted}>
        Photos upload to the Supabase Storage bucket <strong>product-images</strong>. The first photo is the main image; use “Make main” to reorder.
        Prices are in LKR.
      </p>

      {products.map((p) => (
        <div key={p.id} className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>{p.name}</h2>
              <p className={styles.muted}>
                /shop/{p.slug} · {p.active ? "Visible" : "Hidden"} · {p.stock} in stock
              </p>
            </div>
            <a href={`/shop/${p.slug}`} target="_blank" rel="noreferrer" className={`btn btn--soft ${styles.small}`}>
              Open page
            </a>
          </div>

          {p.imageUrls.length > 0 && (
            <div className={styles.thumbs}>
              {p.imageUrls.map((url, i) => (
                <div key={p.images[i]} className={styles.thumb}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" />
                  <div className={styles.inline}>
                    {i > 0 && (
                      <form action={moveProductImage}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="path" value={p.images[i]} />
                        <button>Make main</button>
                      </form>
                    )}
                    <form action={removeProductImage}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="path" value={p.images[i]} />
                      <button>Delete</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form action={saveProduct} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input type="hidden" name="id" value={p.id} />
            <div className={styles.grid3}>
              <label className="field">
                <span className="t-label">Name</span>
                <input className="input" name="name" defaultValue={p.name} required />
              </label>
              <label className="field">
                <span className="t-label">Name (Sinhala)</span>
                <input className="input" name="name_si" defaultValue={p.name_si ?? ""} />
              </label>
              <label className="field">
                <span className="t-label">Card line</span>
                <input className="input" name="summary" defaultValue={p.summary} />
              </label>
              <label className="field">
                <span className="t-label">Price (LKR)</span>
                <input className="input" name="price" type="number" min={0} defaultValue={p.price} required />
              </label>
              <label className="field">
                <span className="t-label">To the fund per shirt (LKR)</span>
                <input className="input" name="fund_amount" type="number" min={0} defaultValue={p.fund_amount} required />
              </label>
              <label className="field">
                <span className="t-label">Stock</span>
                <input className="input" name="stock" type="number" min={0} defaultValue={p.stock} required />
              </label>
              <label className="field">
                <span className="t-label">Colour name</span>
                <input className="input" name="colour_name" defaultValue={p.colour_name} required />
              </label>
              <label className="field">
                <span className="t-label">Swatch colour</span>
                <input className="input" name="colour_hex" type="color" defaultValue={p.colour_hex} style={{ height: 58, padding: 6 }} />
              </label>
              <label className="field">
                <span className="t-label">Sizes (comma separated)</span>
                <input className="input" name="sizes" defaultValue={p.sizes.join(", ")} />
              </label>
            </div>
            <div className={styles.grid2}>
              <label className="field">
                <span className="t-label">Description</span>
                <textarea className="input" name="description" defaultValue={p.description} style={{ minHeight: 110 }} />
              </label>
              <label className="field">
                <span className="t-label">Description (Sinhala)</span>
                <textarea className="input" name="description_si" defaultValue={p.description_si ?? ""} style={{ minHeight: 110 }} />
              </label>
              <label className="field">
                <span className="t-label">Story title</span>
                <input className="input" name="story_title" defaultValue={p.story_title ?? ""} />
              </label>
              <label className="field">
                <span className="t-label">Story text</span>
                <textarea className="input" name="story_body" defaultValue={p.story_body ?? ""} style={{ minHeight: 58 }} />
              </label>
            </div>
            <div className={styles.inline} style={{ gap: 24 }}>
              <label className="field" style={{ flex: "0 1 auto" }}>
                <span className="t-label">Add photos (JPG, PNG, WebP · max 8 MB each)</span>
                <input name="images" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple />
              </label>
              <label className="field" style={{ flex: "0 0 120px" }}>
                <span className="t-label">Order</span>
                <input className="input" name="sort_order" type="number" defaultValue={p.sort_order} />
              </label>
              <label className={styles.check}>
                <input type="checkbox" name="active" defaultChecked={p.active} /> Visible in shop
              </label>
              <button className="btn btn--primary" style={{ marginLeft: "auto" }}>
                Save product
              </button>
            </div>
          </form>
        </div>
      ))}

      <form action={createProduct} className={styles.card}>
        <h2 className={styles.cardTitle}>Add a new design</h2>
        <p className={styles.muted}>New products start hidden. Fill in the details and photos above, then tick “Visible in shop”.</p>
        <div className={styles.grid3}>
          <label className="field">
            <span className="t-label">Name</span>
            <input className="input" name="name" required placeholder="Drop 02 Tee" />
          </label>
          <label className="field">
            <span className="t-label">Colour name</span>
            <input className="input" name="colour_name" placeholder="White tee" />
          </label>
          <label className="field">
            <span className="t-label">Filter group</span>
            <select className="input" name="category" defaultValue="light">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="green">Green</option>
            </select>
          </label>
        </div>
        <button className="btn btn--primary" style={{ alignSelf: "flex-start" }}>
          Create product
        </button>
      </form>
    </>
  );
}
