-- Per-size stock on products, e.g. [{"size": "S", "stock": 10}, {"size": "M", "stock": 5}]
alter table public.products
  add column if not exists sizes jsonb not null default '[]'::jsonb;

-- Which size was purchased on each order line
alter table public.order_items
  add column if not exists size text;

-- Decrement stock for one size within products.sizes (mirrors decrement_stock for total stock)
create or replace function public.decrement_size_stock(p_product_id uuid, p_size text, p_quantity int)
returns void as $$
begin
  update public.products
  set sizes = (
    select coalesce(jsonb_agg(
      case when elem->>'size' = p_size
        then jsonb_set(elem, '{stock}', to_jsonb(greatest(0, (elem->>'stock')::int - p_quantity)))
        else elem
      end
    ), '[]'::jsonb)
    from jsonb_array_elements(sizes) elem
  )
  where id = p_product_id;
end;
$$ language plpgsql security definer;
