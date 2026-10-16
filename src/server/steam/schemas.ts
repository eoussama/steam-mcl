import { z } from "@/lib/zod";



const named = z.array(z.object({ name: z.string() })).optional();

export const resolveVanitySchema = z.object({
  response: z.object({
    success: z.number(),
    steamid: z.string().optional(),
  }),
});

export const playerSummariesSchema = z.object({
  response: z.object({
    players: z.array(z.object({
      steamid: z.string(),
      personaname: z.string(),
      profileurl: z.string(),
      avatarfull: z.string(),
      communityvisibilitystate: z.number(),
    })),
  }),
});

export const ownedGamesSchema = z.object({
  response: z.object({
    game_count: z.number().optional(),
    games: z.array(z.object({
      appid: z.number(),
      name: z.string().optional(),
      playtime_forever: z.number().default(0),
      rtime_last_played: z.number().optional(),
    })).optional(),
  }),
});

export const storeItemSchema = z.object({
  appid: z.number().optional(),
  success: z.number(),
  visible: z.boolean().optional(),
  unlisted: z.boolean().optional(),
  name: z.string().optional(),
  type: z.number().optional(),
  is_free: z.boolean().optional(),
  related_items: z.object({ parent_appid: z.number().optional() }).optional(),
  basic_info: z.object({
    developers: named,
    publishers: named,
    franchises: named,
  }).optional(),
  assets: z.object({
    asset_url_format: z.string().optional(),
    header: z.string().optional(),
    main_capsule: z.string().optional(),
    small_capsule: z.string().optional(),
  }).optional(),
  release: z.object({
    steam_release_date: z.number().optional(),
    is_coming_soon: z.boolean().optional(),
  }).optional(),
  best_purchase_option: z.object({
    formatted_final_price: z.string().optional(),
    final_price_in_cents: z.coerce.number().optional(),
    discount_pct: z.number().optional(),
  }).optional(),
});

export type TRawStoreItem = z.infer<typeof storeItemSchema>;

export const storeItemsSchema = z.object({
  response: z.object({
    store_items: z.array(storeItemSchema).optional(),
  }),
});

export const appDetailsSchema = z.record(
  z.string(),
  z.object({
    success: z.boolean(),
    data: z.object({ dlc: z.array(z.number()).optional() }).optional(),
  }),
);

export const dlcListsSchema = z.object({
  response: z.object({
    dlc_lists: z.array(z.object({
      parent_appid: z.number(),
      dlc_appids: z.array(z.number()).optional(),
    })).optional(),
  }),
});

export const searchResultsSchema = z.object({
  results_html: z.string(),
  total_count: z.number().optional(),
});
