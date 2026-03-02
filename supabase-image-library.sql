-- ============================================================
-- Nored Farms - Image Library Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- IMAGE_LIBRARY: stores metadata for all site images
create table if not exists public.image_library (
    id uuid primary key default gen_random_uuid(),
    filename text not null unique,
    description text,
    category text,
    suggested_placement text[] default '{}',
    file_size integer,
    is_video boolean not null default false,
    tags text[] default '{}',
    notes text,
    updated_by uuid references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Index for fast lookups
create index if not exists idx_image_library_filename on public.image_library(filename);
create index if not exists idx_image_library_category on public.image_library(category);

-- Enable RLS
alter table public.image_library enable row level security;

-- Anyone can read image metadata (public catalog)
create policy "Anyone can read images"
    on public.image_library for select
    using (true);

-- Authenticated users can insert new image records
create policy "Authenticated users can insert images"
    on public.image_library for insert
    with check (auth.role() = 'authenticated');

-- Authenticated users can update image metadata
create policy "Authenticated users can update images"
    on public.image_library for update
    using (auth.role() = 'authenticated');

-- Auto-update updated_at timestamp
create or replace function public.update_image_library_timestamp()
returns trigger as $$
begin
    new.updated_at = now();
    new.updated_by = auth.uid();
    return new;
end;
$$ language plpgsql security definer;

create trigger update_image_library_updated_at
    before update on public.image_library
    for each row execute function public.update_image_library_timestamp();

-- Seed with existing descriptions data
insert into public.image_library (filename, description, category, suggested_placement, file_size, is_video) values
('64383264671__35ACDE3A-B6EB-43E8-AF65-758586040E3F.jpg', 'Hand holding a large freshly harvested black radish with leafy greens, tattoo visible on forearm', 'harvest', ARRAY['Blog', 'Products', 'About/Story'], 690168, false),
('71461679852__972CBE57-ABC2-4E41-AC80-00C11D511555.jpg', 'Lush basil plants growing in containers on a wooden porch/deck', 'garden', ARRAY['Blog', 'Homepage', 'About/Story'], 847889, false),
('71461732811__A63FA18B-0AE8-4980-8834-4FEAD19B59FC.jpg', 'San Pedro / Trichocereus cactus seedlings in small nursery pots under grow lights', 'nursery', ARRAY['Products', 'Research', 'Classroom'], 568249, false),
('71583752537__CC26FAF1-9EFA-4157-8D87-9DE608CFFCA1.mp4', null, null, '{}', 4290931, true),
('71583759913__02D6BC78-59F2-47D0-87C6-267731CD72D0.mp4', null, null, '{}', 8783312, true),
('71857742523__5BDB8733-9CD2-4396-A09C-EAB856180C0C.jpg', 'Indoor grow shelf with cannabis/hemp seedling trays (top) and smaller seedling trays in humidity domes (bottom) under fluorescent lights', 'cultivation', ARRAY['Classroom', 'Research', 'Blog'], 741506, false),
('72147166722__327AB19B-59DD-4064-B0DA-0851706BAE63.jpg', 'Indoor grow tent with San Pedro cacti, tropical plants, and various botanical specimens under LED grow lights on metal shelving', 'nursery', ARRAY['About/Story', 'Research', 'Lab'], 990277, false),
('DSC_6805.jpg', 'Stunning sunset landscape photo - lone yucca/Joshua tree silhouetted against orange-pink Texas desert sky, wide open scrubland', 'landscape', ARRAY['Homepage', 'Hero Banner', 'About/Story'], 396690, false),
('IMG_0142.jpg', 'Young plant growing in dry Texas soil, broad palmate leaves - possibly comfrey or similar medicinal herb', 'wild_plants', ARRAY['Research', 'Blog', 'Article Header'], 970435, false),
('IMG_0148.jpg', 'Purple/red kale (Redbor variety) growing densely with bamboo stakes for support, close-up showing vibrant purple stems', 'garden', ARRAY['Blog', 'Products', 'Homepage'], 671092, false),
('IMG_0289.jpg', 'Kanna (Sceletium tortuosum) or similar succulent cuttings/plants in pots on a wire shelf under grow lights', 'nursery', ARRAY['Products', 'Research', 'Classroom'], 895492, false),
('IMG_0292.jpg', 'Rosemary or similar narrow-leaf herb seedlings in nursery trays, dense propagation setup', 'nursery', ARRAY['Products', 'Classroom', 'Blog'], 692344, false),
('IMG_0293.jpg', 'Indoor seedling nursery under grow lights - multiple small pots with young tobacco or similar broad-leaf seedlings at various stages', 'nursery', ARRAY['Classroom', 'Research', 'About/Story'], 764887, false),
('IMG_0326.jpg', 'Raised herb garden bed with brick edging against a brick building - mixed herbs and flowers, wire cages for support', 'garden', ARRAY['Homepage', 'About/Story', 'Blog'], 904129, false),
('IMG_0346.jpg', 'Iridescent green June beetle / fig beetle on decaying wood with shelf fungi - beautiful macro nature shot', 'nature', ARRAY['Blog', 'Research', 'Article Header'], 767029, false),
('IMG_0349.jpg', 'Wild barrel cactus cluster growing in rocky terrain with long dark spines, close-up detail shot', 'wild_plants', ARRAY['Research', 'Blog', 'Article Header'], 328603, false),
('IMG_0357.jpg', 'Peach or similar fruit tree with ripening/split fruit showing red-pink flesh among colorful variegated leaves', 'garden', ARRAY['Products', 'Blog', 'Research'], 248364, false),
('IMG_0479.jpg', 'Screenshot of Facebook post - massive mature San Pedro cactus colony growing outdoors, towering cluster', 'reference', ARRAY['Research', 'Blog'], 427526, false),
('IMG_0484.jpg', 'Screenshot of Facebook post - large Trichocereus pachanoi Powerline clone, hand for scale showing massive girth', 'reference', ARRAY['Research', 'Blog'], 385242, false),
('IMG_0485.jpg', 'Screenshot of Facebook post - Trichocereus Ear Grabber clone with flower bud, and close-up of Lophophora cactus below', 'reference', ARRAY['Research'], 274963, false),
('IMG_0486.jpg', 'Screenshot of Facebook post - tall San Pedro cacti growing in mountainous landscape, dramatic misty mountains backdrop', 'reference', ARRAY['Research', 'Blog', 'Hero Banner'], 303612, false),
('IMG_0489.jpg', 'Large mature San Pedro / Trichocereus colony outside a house, massive spreading growth - reference photo', 'reference', ARRAY['Research', 'Blog'], 399790, false),
('IMG_0573.jpg', 'Potted San Pedro cactus seedling with spines, surrounded by other cacti varieties at night under artificial light', 'nursery', ARRAY['Products', 'Research'], 633772, false),
('IMG_0574.jpg', 'San Pedro cactus with multiple pups/offsets growing from base, showing flower bud, in black nursery pot at night', 'nursery', ARRAY['Products', 'Research', 'Blog'], 517641, false),
('IMG_0629.jpg', 'Trays of San Pedro cactus seedlings under grow lights, dozens of young columnar cacti in individual cells with blue labels', 'nursery', ARRAY['Products', 'Classroom', 'About/Story'], 514056, false),
('IMG_0642.jpg', 'Stainless steel extraction equipment - closed-loop BHO/hydrocarbon extraction manifold with braided hoses and yellow ball valves, outdoor setup', 'extraction_equipment', ARRAY['Consulting', 'Classroom', 'Research'], 954744, false),
('IMG_0659.jpg', 'Black dog wading in clear lake water on a sunny day - Texas lakeside nature scene', 'lifestyle', ARRAY['About/Story', 'Blog'], 895289, false),
('IMG_0660.jpg', 'Large indoor cannabis cultivation room under HPS lights - rows of mature flowering plants in black pots with trellis netting, commercial scale', 'cultivation', ARRAY['Consulting', 'Classroom', 'Blog'], 850481, false),
('IMG_0673.jpg', 'Screenshot from future4200.com - closed-loop BHO extraction setup in a tent with pressure gauge, stainless steel column, insulated lines', 'extraction_equipment', ARRAY['Classroom', 'Consulting', 'Research'], 262895, false),
('IMG_0726.jpg', 'Beautiful ocean/Gulf Coast sunset - sandbar stretching into calm water, dramatic clouds with golden light', 'landscape', ARRAY['Homepage', 'Hero Banner', 'About/Story'], 784086, false),
('IMG_0728.jpg', 'Large extraction vessel in workshop - insulated tank wrapped in foil tape, stainless steel column beside it, OSB-walled workspace', 'extraction_equipment', ARRAY['Consulting', 'Classroom', 'About/Story'], 419586, false),
('IMG_0729.jpg', 'Multi-column stainless steel extraction rack system - 5 parallel columns with pressure gauges, professional setup in workshop', 'extraction_equipment', ARRAY['Consulting', 'Classroom', 'Homepage'], 572329, false),
('IMG_0730.jpg', 'Professional extraction lab interior - insulated lines, stainless vessels, explosion-proof lighting, pumps, gas cylinders - commercial scale C1D1 room', 'extraction_equipment', ARRAY['Homepage', 'Consulting', 'Classroom'], 403888, false),
('IMG_0731.jpg', 'Another angle of commercial extraction lab - insulated column array, stainless vessels, pressure gauges, yellow ball valves, professional setup', 'extraction_equipment', ARRAY['Homepage', 'Consulting', 'Classroom'], 492124, false),
('IMG_0732.jpg', 'Commercial extraction lab - multiple stainless columns, recovery pump, CO2/solvent tank, red hoses, professional C1D1 rated room', 'extraction_equipment', ARRAY['Homepage', 'Consulting', 'Classroom'], 413636, false),
('IMG_0733.jpg', 'Extraction equipment close-up - frosted recovery vessel on stand with scale readout, pump, insulated lines, professional lab', 'extraction_equipment', ARRAY['Consulting', 'Classroom', 'Research'], 342798, false),
('IMG_0733.mp4', null, null, '{}', 13478816, true),
('IMG_0749.jpg', 'Small succulent-like plant cuttings with red stems in a white pot with perlite - propagation', 'nursery', ARRAY['Products', 'Blog'], 689554, false),
('IMG_0750.jpg', 'Polished resin or extract domes/half-spheres on kitchen counter - dark amber/brown, multiple sizes, glossy finish', 'finished_product', ARRAY['Products', 'Homepage', 'Blog'], 977754, false),
('IMG_0751.jpg', 'Same extract domes from above angle - approximately 10 polished dome shapes in various amber/dark brown shades on speckled counter', 'finished_product', ARRAY['Products', 'Homepage', 'Blog'], 333245, false),
('IMG_0753.jpg', 'Two large dark purple/maroon extract pucks - polished, glossy, kidney-shaped on kitchen counter', 'finished_product', ARRAY['Products', 'Homepage'], 926564, false),
('IMG_0756.jpg', 'Single extract dome/puck side view - shows layered coloring (amber top, dark bottom), macro detail on speckled counter', 'finished_product', ARRAY['Products', 'Blog'], 542357, false),
('IMG_0892.jpg', 'Dense carpet of Kanna (Sceletium tortuosum) or similar succulent ground cover with white/yellow daisy-like flowers, growing in red soil', 'wild_plants', ARRAY['Research', 'Blog', 'Products'], 321302, false),
('IMG_0893.jpg', 'Close-up of same succulent ground cover with white feathery flowers - Sceletium/Kanna species in bloom', 'wild_plants', ARRAY['Research', 'Blog', 'Products'], 235915, false),
('IMG_0922.mp4', null, null, '{}', 6992406, true),
('IMG_0923.jpg', 'Outdoor hillside cannabis farm - plants among dry grass with hoop houses visible, California-style guerrilla/sun-grown operation', 'cultivation', ARRAY['Blog', 'Research', 'Consulting'], 192092, false),
('IMG_0928.jpg', 'Large commercial indoor cultivation facility - rows of raised flood tables under HPS lights, clone/veg stage, industrial scale', 'cultivation', ARRAY['Consulting', 'Classroom', 'Blog'], 776560, false),
('IMG_0929.jpg', 'Wild mushrooms growing in grass - small tan/white parasol-type mushrooms in a lawn, foraging subject', 'nature', ARRAY['Research', 'Blog', 'Article Header'], 320195, false),
('IMG_0949.jpg', 'Beautiful wild bolete mushroom - golden yellow stem with red/orange cap, macro photo on forest floor with rocks and leaves', 'nature', ARRAY['Research', 'Blog', 'Article Header', 'Homepage'], 786336, false),
('IMG_0957.jpg', 'Texas Hill Country pond/creek - green rolling hills, calm water with reeds, overcast sky, peaceful rural landscape', 'landscape', ARRAY['Homepage', 'About/Story', 'Hero Banner'], 1011759, false),
('IMG_0963.jpg', 'Stunning moonlit night landscape - full moon reflecting on still pond/lake, stars visible, Texas Hill Country silhouette', 'landscape', ARRAY['Homepage', 'Hero Banner', 'About/Story'], 262755, false),
('IMG_0964.jpg', 'Same moonlit scene, different angle - moon reflecting on winding creek/river, wispy clouds, Hill Country horizon', 'landscape', ARRAY['Homepage', 'Hero Banner', 'About/Story'], 328178, false),
('IMG_1018.jpg', 'Cannabis flower close-up - dense trichome-covered bud under HPS grow lights, purple and orange hues, professional macro', 'cultivation', ARRAY['Products', 'Blog', 'Research'], 623404, false),
('IMG_1019.jpg', 'Cannabis flower close-up - frosty trichome-laden cola, professional macro photography showing crystal structure', 'cultivation', ARRAY['Products', 'Blog', 'Research'], 686237, false)
on conflict (filename) do update set
    description = excluded.description,
    category = excluded.category,
    suggested_placement = excluded.suggested_placement,
    file_size = excluded.file_size,
    is_video = excluded.is_video;

-- Insert remaining files without descriptions
insert into public.image_library (filename, file_size, is_video) values
('IMG_1020.jpg', 571163, false),
('IMG_1057.jpg', 786359, false),
('IMG_1066.jpg', 1026157, false),
('IMG_1082.jpg', 885376, false),
('IMG_1104.jpg', 663571, false),
('IMG_1232.jpg', 585893, false),
('IMG_1329.jpg', 607050, false),
('IMG_1387.jpg', 749221, false),
('IMG_1388.jpg', 1003276, false),
('IMG_1392.jpg', 330720, false),
('IMG_1467.jpg', 1003639, false),
('IMG_1475.jpg', 377457, false),
('IMG_1518.jpg', 1027270, false),
('IMG_1547.jpg', 745146, false),
('IMG_1550.jpg', 299082, false),
('IMG_1578.jpg', 582795, false),
('IMG_1581.jpg', 288734, false),
('IMG_1583.jpg', 494884, false),
('IMG_1658.jpg', 329526, false),
('IMG_1660.jpg', 843577, false),
('IMG_1663.jpg', 362646, false),
('IMG_1665.jpg', 375271, false),
('IMG_1666.jpg', 300994, false),
('IMG_1667.jpg', 356420, false),
('IMG_1668.jpg', 992914, false),
('IMG_1945.jpg', 407290, false),
('IMG_2009.jpg', 213939, false),
('IMG_2063.jpg', 310077, false),
('IMG_2066.jpg', 387947, false),
('IMG_2229.jpg', 352581, false),
('IMG_2288.jpg', 748169, false),
('IMG_2415.jpg', 379914, false),
('IMG_2445.jpg', 817691, false),
('IMG_2446.jpg', 615195, false),
('IMG_2554.jpg', 293721, false),
('IMG_2556.jpg', 341806, false),
('IMG_2559.jpg', 281798, false),
('IMG_2562.jpg', 391258, false),
('IMG_2563.jpg', 331138, false),
('IMG_2589.jpg', 779723, false),
('IMG_2628.jpg', 617017, false),
('IMG_2629.jpg', 771727, false),
('IMG_2753.jpg', 316733, false),
('IMG_2810.jpg', 1001414, false),
('IMG_2815.jpg', 717313, false),
('IMG_2816.jpg', 799321, false),
('IMG_2818.jpg', 339982, false),
('IMG_2819.mp4', 5889886, true),
('IMG_3072.jpg', 322627, false),
('IMG_3073.jpg', 331766, false),
('IMG_3074.jpg', 1010886, false),
('IMG_3134.jpg', 698415, false),
('IMG_3135.jpg', 746628, false),
('IMG_3136.jpg', 612538, false),
('IMG_3138.mp4', 5364621, true),
('IMG_3141.mp4', 3168938, true),
('IMG_3198.jpg', 256529, false),
('IMG_3200.jpg', 176158, false),
('IMG_5448.jpg', 604158, false),
('IMG_5451.jpg', 581792, false),
('IMG_6197.jpg', 772222, false),
('IMG_6805.jpg', 376388, false),
('IMG_7081.jpg', 990796, false),
('IMG_7082.jpg', 955944, false),
('IMG_7245.jpg', 372744, false),
('IMG_7258.jpg', 667377, false),
('IMG_8335.jpg', 470846, false),
('IMG_8642.jpg', 939947, false),
('IMG_8646.jpg', 1031569, false),
('IMG_8758.jpg', 799907, false),
('IMG_8904.jpg', 89758, false),
('IMG_9240.jpg', 1018512, false),
('IMG_9246.jpg', 763685, false),
('IMG_9251.jpg', 983681, false),
('IMG_9267.mp4', 4966918, true),
('IMG_9268.mp4', 5609642, true),
('IMG_9269.jpg', 1041607, false),
('IMG_9270.mp4', 7261118, true),
('IMG_9272.jpg', 934597, false),
('IMG_9273.mp4', 7213136, true),
('IMG_9274.mp4', 6941468, true),
('IMG_9275.jpg', 897396, false),
('IMG_9277.mp4', 6430716, true),
('IMG_9278.mp4', 5962002, true),
('IMG_9512.jpg', 407211, false),
('IMG_9558.jpg', 818301, false),
('signal-2025-08-13-171746.jpg', 378145, false),
('signal-2025-08-19-181745.jpg', 364269, false),
('signal-2025-08-19-181817.jpg', 285180, false),
('signal-2025-08-19-184109.jpg', 411722, false)
on conflict (filename) do nothing;
