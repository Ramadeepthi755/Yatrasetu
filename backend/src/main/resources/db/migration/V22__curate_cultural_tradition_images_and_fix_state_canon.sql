-- ============================================================================
-- YatraSetu Migration V22: Curate Cultural Tradition Images & Canonical 36 States
-- ============================================================================
-- 1. Fix geography: Relink legacy city references to canonical States
-- 2. Clean up 3 obsolete/duplicate pseudo states (IN-JA, IN-KE, IN-MA) -> 36 Canonical States & UTs
-- 3. Update all 100 Cultural Traditions with authentic, distinct craft image URLs
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SECTION 1: CANONICAL GEOGRAPHY CLEANUP (36 States & Union Territories)
-- ----------------------------------------------------------------------------

-- Reassign legacy city references
UPDATE cities SET state_id = 'IN-KL', district_name = 'Kasaragod', updated_at = NOW() WHERE id = 'multiple-kasargod';
UPDATE cities SET state_id = 'IN-MP', district_name = 'Anuppur', updated_at = NOW() WHERE id = 'anuppur-region';

-- Ensure no destinations reference pseudo states
UPDATE destinations SET state_id = 'IN-KL', updated_at = NOW() WHERE state_id = 'IN-KE';
UPDATE destinations SET state_id = 'IN-MP', updated_at = NOW() WHERE state_id = 'IN-MA';
UPDATE destinations SET state_id = 'IN-JK', updated_at = NOW() WHERE state_id = 'IN-JA';

-- Ensure no cultural traditions reference pseudo states
UPDATE cultural_traditions SET state_id = 'IN-KL', updated_at = NOW() WHERE state_id = 'IN-KE';
UPDATE cultural_traditions SET state_id = 'IN-MP', updated_at = NOW() WHERE state_id = 'IN-MA';
UPDATE cultural_traditions SET state_id = 'IN-JK', updated_at = NOW() WHERE state_id = 'IN-JA';

-- Ensure no local hosts reference pseudo states
UPDATE local_hosts SET state_id = 'IN-KL', updated_at = NOW() WHERE state_id = 'IN-KE';
UPDATE local_hosts SET state_id = 'IN-MP', updated_at = NOW() WHERE state_id = 'IN-MA';
UPDATE local_hosts SET state_id = 'IN-JK', updated_at = NOW() WHERE state_id = 'IN-JA';

-- Remove the 3 obsolete / duplicate states to achieve the official 36 States & UTs
DELETE FROM states WHERE id IN ('IN-JA', 'IN-KE', 'IN-MA');

-- ----------------------------------------------------------------------------
-- SECTION 2: AUTHENTIC CRAFT IMAGE CURATION (100 Distinct Traditions)
-- ----------------------------------------------------------------------------

UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Nicobarese_Cane_Mat_Weaving.jpg/800px-Nicobarese_Cane_Mat_Weaving.jpg', updated_at = NOW() WHERE id = 'cult-an-nicobar-mat';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Andaman_Sea_Shell_Craft.jpg/800px-Andaman_Sea_Shell_Craft.jpg', updated_at = NOW() WHERE id = 'cult-an-shell-craft';
UPDATE cultural_traditions SET image_url = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', updated_at = NOW() WHERE id = 'cult-ap-dharmavaram';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Kalamkari_art_tree_of_life.jpg/800px-Kalamkari_art_tree_of_life.jpg', updated_at = NOW() WHERE id = 'cult-ap-kalamkari';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Kondapalli_Toys_01.jpg/800px-Kondapalli_Toys_01.jpg', updated_at = NOW() WHERE id = 'cult-ap-kondapalli';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Block_printing_in_India.jpg/800px-Block_printing_in_India.jpg', updated_at = NOW() WHERE id = 'cult-ap-machilipatnam';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Apatani_Weaving_Arunachal.jpg/800px-Apatani_Weaving_Arunachal.jpg', updated_at = NOW() WHERE id = 'cult-ar-apatani-weave';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Monpa_Handmade_Paper_Making.jpg/800px-Monpa_Handmade_Paper_Making.jpg', updated_at = NOW() WHERE id = 'cult-ar-monpa-paper';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Wancho_Wood_Carving_Arunachal.jpg/800px-Wancho_Wood_Carving_Arunachal.jpg', updated_at = NOW() WHERE id = 'cult-ar-wancho-wood';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Majuli_Mask_Mukha_Assam.jpg/800px-Majuli_Mask_Mukha_Assam.jpg', updated_at = NOW() WHERE id = 'cult-as-majuli-mask';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Muga_Silk_Assam.jpg/800px-Muga_Silk_Assam.jpg', updated_at = NOW() WHERE id = 'cult-as-muga-silk';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Sarthebari_Bell_Metal_Kahi.jpg/800px-Sarthebari_Bell_Metal_Kahi.jpg', updated_at = NOW() WHERE id = 'cult-as-sarthebari';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Madhubani_painting_Mithila.jpg/800px-Madhubani_painting_Mithila.jpg', updated_at = NOW() WHERE id = 'cult-br-madhubani';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Sikki_Grass_Craft_Bihar.jpg/800px-Sikki_Grass_Craft_Bihar.jpg', updated_at = NOW() WHERE id = 'cult-br-sikki';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Sujuni_Embroidery_Bihar.jpg/800px-Sujuni_Embroidery_Bihar.jpg', updated_at = NOW() WHERE id = 'cult-br-sujuni';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Bastar_Dhokra_Bell_Metal.jpg/800px-Bastar_Dhokra_Bell_Metal.jpg', updated_at = NOW() WHERE id = 'cult-cg-bastar-dhokra';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Bastar_Iron_Craft_Loha_Shilp.jpg/800px-Bastar_Iron_Craft_Loha_Shilp.jpg', updated_at = NOW() WHERE id = 'cult-cg-bastar-iron';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Bastar_Terracotta_Pottery.jpg/800px-Bastar_Terracotta_Pottery.jpg', updated_at = NOW() WHERE id = 'cult-cg-terracotta';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Rock_Garden_Chandigarh_Sculpture_Assemblage.jpg/800px-Rock_Garden_Chandigarh_Sculpture_Assemblage.jpg', updated_at = NOW() WHERE id = 'cult-ch-assemblage';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Daman_DNH_Warli_Art.jpg/800px-Daman_DNH_Warli_Art.jpg', updated_at = NOW() WHERE id = 'cult-dh-warli';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Meenakari_Enamelling_Art.jpg/800px-Meenakari_Enamelling_Art.jpg', updated_at = NOW() WHERE id = 'cult-dl-meenakari';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Zardozi_Metallic_Embroidery_Delhi.jpg/800px-Zardozi_Metallic_Embroidery_Delhi.jpg', updated_at = NOW() WHERE id = 'cult-dl-zardozi';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Goan_Azulejos_Tile.jpg/800px-Goan_Azulejos_Tile.jpg', updated_at = NOW() WHERE id = 'cult-ga-azulejos';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Kunbi_Saree_Goa.jpg/800px-Kunbi_Saree_Goa.jpg', updated_at = NOW() WHERE id = 'cult-ga-kunbi';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Bandhani_Tie_and_Dye_Gujarat.jpg/800px-Bandhani_Tie_and_Dye_Gujarat.jpg', updated_at = NOW() WHERE id = 'cult-gj-bandhani';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Lippan_Kaam_Mud_Mirror_Work.jpg/800px-Lippan_Kaam_Mud_Mirror_Work.jpg', updated_at = NOW() WHERE id = 'cult-gj-kutch-lippan';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Patan_Patola_Double_Ikat.jpg/800px-Patan_Patola_Double_Ikat.jpg', updated_at = NOW() WHERE id = 'cult-gj-patan-patola';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Rogan_Art_Nirona_Kutch.jpg/800px-Rogan_Art_Nirona_Kutch.jpg', updated_at = NOW() WHERE id = 'cult-gj-rogan';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Chamba_Rumal_Embroidery.jpg/800px-Chamba_Rumal_Embroidery.jpg', updated_at = NOW() WHERE id = 'cult-hp-chamba-rumal';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Kangra_Miniature_Painting.jpg/800px-Kangra_Miniature_Painting.jpg', updated_at = NOW() WHERE id = 'cult-hp-kangra-painting';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Kullu_Shawl_Geometric_Pattern.jpg/800px-Kullu_Shawl_Geometric_Pattern.jpg', updated_at = NOW() WHERE id = 'cult-hp-kullu-shawl';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Panipat_Handloom_Textiles.jpg/800px-Panipat_Handloom_Textiles.jpg', updated_at = NOW() WHERE id = 'cult-hr-panipat-handloom';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Rewari_Brass_Utensils.jpg/800px-Rewari_Brass_Utensils.jpg', updated_at = NOW() WHERE id = 'cult-hr-rewari-metal';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Dhokra_Craft_Tribal_Art.jpg/800px-Dhokra_Craft_Tribal_Art.jpg', updated_at = NOW() WHERE id = 'cult-jh-dhokra';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Sohrai_Painting_Hazaribagh.jpg/800px-Sohrai_Painting_Hazaribagh.jpg', updated_at = NOW() WHERE id = 'cult-jh-sohrai-khovar';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Kani_Shawl_Weaving_Kashmir.jpg/800px-Kani_Shawl_Weaving_Kashmir.jpg', updated_at = NOW() WHERE id = 'cult-jk-kani';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Kashmir_Paper_Mache_Box.jpg/800px-Kashmir_Paper_Mache_Box.jpg', updated_at = NOW() WHERE id = 'cult-jk-paper-mache';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Kashmir_Pashmina_Shawl.jpg/800px-Kashmir_Pashmina_Shawl.jpg', updated_at = NOW() WHERE id = 'cult-jk-pashmina';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Kashmir_Walnut_Wood_Carving.jpg/800px-Kashmir_Walnut_Wood_Carving.jpg', updated_at = NOW() WHERE id = 'cult-jk-wood-carving';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Bidriware_Vase_India.jpg/800px-Bidriware_Vase_India.jpg', updated_at = NOW() WHERE id = 'cult-ka-bidriware';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Channapatna_toys_display.jpg/800px-Channapatna_toys_display.jpg', updated_at = NOW() WHERE id = 'cult-ka-channapatna';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Ilkal_saree_pallu.jpg/800px-Ilkal_saree_pallu.jpg', updated_at = NOW() WHERE id = 'cult-ka-ilkal';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Mysore_Silk_Saree.jpg/800px-Mysore_Silk_Saree.jpg', updated_at = NOW() WHERE id = 'cult-ka-mysore-silk';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Aranmula_kannadi_mirror.jpg/800px-Aranmula_kannadi_mirror.jpg', updated_at = NOW() WHERE id = 'cult-kl-aranmula';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Kasavu_Mundu_Kerala.jpg/800px-Kasavu_Mundu_Kerala.jpg', updated_at = NOW() WHERE id = 'cult-kl-balaramapuram';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Coir_spinning_wheel_Kerala.jpg/800px-Coir_spinning_wheel_Kerala.jpg', updated_at = NOW() WHERE id = 'cult-kl-coir';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Kathakali_dancer_performing.jpg/800px-Kathakali_dancer_performing.jpg', updated_at = NOW() WHERE id = 'cult-kl-kathakali';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Changthangi_Goat_Ladakh_Pashmina.jpg/800px-Changthangi_Goat_Ladakh_Pashmina.jpg', updated_at = NOW() WHERE id = 'cult-la-pashmina';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Ladakh_Thangka_Scroll.jpg/800px-Ladakh_Thangka_Scroll.jpg', updated_at = NOW() WHERE id = 'cult-la-thangka';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Ladakh_Wood_Carving_Dragon.jpg/800px-Ladakh_Wood_Carving_Dragon.jpg', updated_at = NOW() WHERE id = 'cult-la-wood-carving';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Lakshadweep_Coir_Craft.jpg/800px-Lakshadweep_Coir_Craft.jpg', updated_at = NOW() WHERE id = 'cult-ld-coir-craft';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Kolhapuri_Chappal_Leather.jpg/800px-Kolhapuri_Chappal_Leather.jpg', updated_at = NOW() WHERE id = 'cult-mh-kolhapuri';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Paithani_Saree_Pallu_Peacock.jpg/800px-Paithani_Saree_Pallu_Peacock.jpg', updated_at = NOW() WHERE id = 'cult-mh-paithani';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Warli_Painting_Maharashtra.jpg/800px-Warli_Painting_Maharashtra.jpg', updated_at = NOW() WHERE id = 'cult-mh-warli';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Khasi_Cane_Bamboo_Knup.jpg/800px-Khasi_Cane_Bamboo_Knup.jpg', updated_at = NOW() WHERE id = 'cult-ml-khasi-cane';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Ryndia_Eri_Silk_Meghalaya.jpg/800px-Ryndia_Eri_Silk_Meghalaya.jpg', updated_at = NOW() WHERE id = 'cult-ml-ryndia-eri';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Kauna_Reed_Craft_Manipur.jpg/800px-Kauna_Reed_Craft_Manipur.jpg', updated_at = NOW() WHERE id = 'cult-mn-kauna-craft';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Longpi_Black_Pottery_Manipur.jpg/800px-Longpi_Black_Pottery_Manipur.jpg', updated_at = NOW() WHERE id = 'cult-mn-longpi';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Moirang_Phee_Handloom_Manipur.jpg/800px-Moirang_Phee_Handloom_Manipur.jpg', updated_at = NOW() WHERE id = 'cult-mn-moirang-phee';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Bagh_Print_Textile_MP.jpg/800px-Bagh_Print_Textile_MP.jpg', updated_at = NOW() WHERE id = 'cult-mp-bagh';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Chanderi_Fabric_Weaving.jpg/800px-Chanderi_Fabric_Weaving.jpg', updated_at = NOW() WHERE id = 'cult-mp-chanderi';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Gond_Painting_Madhya_Pradesh.jpg/800px-Gond_Painting_Madhya_Pradesh.jpg', updated_at = NOW() WHERE id = 'cult-mp-gond';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Mizo_Bamboo_Hat_Khumbeu.jpg/800px-Mizo_Bamboo_Hat_Khumbeu.jpg', updated_at = NOW() WHERE id = 'cult-mz-bamboo';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Mizo_Puan_Handloom.jpg/800px-Mizo_Puan_Handloom.jpg', updated_at = NOW() WHERE id = 'cult-mz-puan';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Naga_Traditional_Shawl_Weaving.jpg/800px-Naga_Traditional_Shawl_Weaving.jpg', updated_at = NOW() WHERE id = 'cult-nl-naga-shawl';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Naga_Morung_Wood_Carving.jpg/800px-Naga_Morung_Wood_Carving.jpg', updated_at = NOW() WHERE id = 'cult-nl-wood-carving';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Tarakasi_Silver_Filigree_Cuttack.jpg/800px-Tarakasi_Silver_Filigree_Cuttack.jpg', updated_at = NOW() WHERE id = 'cult-od-cuttack-tarakasi';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Pattachitra_Raghurajpur.jpg/800px-Pattachitra_Raghurajpur.jpg', updated_at = NOW() WHERE id = 'cult-od-pattachitra';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Pipili_Applique_Work.jpg/800px-Pipili_Applique_Work.jpg', updated_at = NOW() WHERE id = 'cult-od-pipili';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Sambalpuri_Ikat_Saree.jpg/800px-Sambalpuri_Ikat_Saree.jpg', updated_at = NOW() WHERE id = 'cult-od-sambalpuri';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Punjabi_Jutti_Handcrafted.jpg/800px-Punjabi_Jutti_Handcrafted.jpg', updated_at = NOW() WHERE id = 'cult-pb-jutti';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Phulkari_Dupatta_Punjab.jpg/800px-Phulkari_Dupatta_Punjab.jpg', updated_at = NOW() WHERE id = 'cult-pb-phulkari';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Puducherry_Handmade_Paper_Craft.jpg/800px-Puducherry_Handmade_Paper_Craft.jpg', updated_at = NOW() WHERE id = 'cult-py-handmade-paper';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Villianur_Terracotta_Puducherry.jpg/800px-Villianur_Terracotta_Puducherry.jpg', updated_at = NOW() WHERE id = 'cult-py-terracotta';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Bagru_Block_Printing_Rajasthan.jpg/800px-Bagru_Block_Printing_Rajasthan.jpg', updated_at = NOW() WHERE id = 'cult-rj-bagru-print';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Jaipur_Blue_Pottery_Plates.jpg/800px-Jaipur_Blue_Pottery_Plates.jpg', updated_at = NOW() WHERE id = 'cult-rj-blue-pottery';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Nathdwara_Pichwai_Shrinathji.jpg/800px-Nathdwara_Pichwai_Shrinathji.jpg', updated_at = NOW() WHERE id = 'cult-rj-pichwai';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Thewa_Jewellery_Gold_Work.jpg/800px-Thewa_Jewellery_Gold_Work.jpg', updated_at = NOW() WHERE id = 'cult-rj-thewa';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Choktse_Table_Woodcarving_Sikkim.jpg/800px-Choktse_Table_Woodcarving_Sikkim.jpg', updated_at = NOW() WHERE id = 'cult-sk-choktse';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Sikkim_Buddhist_Thangka.jpg/800px-Sikkim_Buddhist_Thangka.jpg', updated_at = NOW() WHERE id = 'cult-sk-thangka';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Cheriyal_scroll_painting.jpg/800px-Cheriyal_scroll_painting.jpg', updated_at = NOW() WHERE id = 'cult-tg-cheriyal';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Pembarthi_sheet_metal_art.jpg/800px-Pembarthi_sheet_metal_art.jpg', updated_at = NOW() WHERE id = 'cult-tg-pembarthi';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Pochampally_sari.jpg/800px-Pochampally_sari.jpg', updated_at = NOW() WHERE id = 'cult-tg-pochampally';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Kanchipuram_Silk_Weaving.jpg/800px-Kanchipuram_Silk_Weaving.jpg', updated_at = NOW() WHERE id = 'cult-tn-kanchipuram';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Swamimalai_Bronze_Idol.jpg/800px-Swamimalai_Bronze_Idol.jpg', updated_at = NOW() WHERE id = 'cult-tn-swamimalai';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Thanjavur_painting_Ganesha.jpg/800px-Thanjavur_painting_Ganesha.jpg', updated_at = NOW() WHERE id = 'cult-tn-thanjavur-painting';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Toda_Embroidery_Shawl.jpg/800px-Toda_Embroidery_Shawl.jpg', updated_at = NOW() WHERE id = 'cult-tn-toda';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Tripura_Bamboo_Screens_Craft.jpg/800px-Tripura_Bamboo_Screens_Craft.jpg', updated_at = NOW() WHERE id = 'cult-tr-cane-bamboo';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Tripura_Risa_Textile.jpg/800px-Tripura_Risa_Textile.jpg', updated_at = NOW() WHERE id = 'cult-tr-risa';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Firozabad_Glass_Bangles.jpg/800px-Firozabad_Glass_Bangles.jpg', updated_at = NOW() WHERE id = 'cult-up-firozabad-glass';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Lucknow_Chikan_Embroidery.jpg/800px-Lucknow_Chikan_Embroidery.jpg', updated_at = NOW() WHERE id = 'cult-up-lucknow-chikan';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Moradabad_Brassware_Work.jpg/800px-Moradabad_Brassware_Work.jpg', updated_at = NOW() WHERE id = 'cult-up-moradabad-brass';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Banarasi_Silk_Saree_Weave.jpg/800px-Banarasi_Silk_Saree_Weave.jpg', updated_at = NOW() WHERE id = 'cult-up-varanasi-silk';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Aipan_Art_Uttarakhand.jpg/800px-Aipan_Art_Uttarakhand.jpg', updated_at = NOW() WHERE id = 'cult-ut-aipan';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Ringal_Bamboo_Craft_Himalayas.jpg/800px-Ringal_Bamboo_Craft_Himalayas.jpg', updated_at = NOW() WHERE id = 'cult-ut-ringal';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Thulma_Blanket_Weave_Uttarakhand.jpg/800px-Thulma_Blanket_Weave_Uttarakhand.jpg', updated_at = NOW() WHERE id = 'cult-ut-thulma';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Baluchari_Saree_Motif.jpg/800px-Baluchari_Saree_Motif.jpg', updated_at = NOW() WHERE id = 'cult-wb-baluchari';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Bankura_Horse_Bishnupur.jpg/800px-Bankura_Horse_Bishnupur.jpg', updated_at = NOW() WHERE id = 'cult-wb-bankura-terracotta';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Dokra_artifact_Bengal.jpg/800px-Dokra_artifact_Bengal.jpg', updated_at = NOW() WHERE id = 'cult-wb-dokra';
UPDATE cultural_traditions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Kantha_stitch_embroidery.jpg/800px-Kantha_stitch_embroidery.jpg', updated_at = NOW() WHERE id = 'cult-wb-kantha';
