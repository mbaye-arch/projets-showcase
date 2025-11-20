/// Modèle Produit
class ProduitModel {
  final int id;
  final int boutiqueId;
  final int? categorieId;
  final int? marqueId;
  final String nom;
  final String slug;
  final String? description;
  final double prix;
  final double? prixPromo;
  final String? imageUrl;
  final List<String>? images;
  final int stock;
  final bool disponible;
  final bool nouveaute;
  final bool coupDeCoeur;
  final bool enPromotion;
  final double? note;
  final int? nombreVues;
  final String? boutique;
  final String? categorie;
  final String? marque;
  final DateTime createdAt;
  final DateTime updatedAt;

  ProduitModel({
    required this.id,
    required this.boutiqueId,
    this.categorieId,
    this.marqueId,
    required this.nom,
    required this.slug,
    this.description,
    required this.prix,
    this.prixPromo,
    this.imageUrl,
    this.images,
    this.stock = 0,
    this.disponible = true,
    this.nouveaute = false,
    this.coupDeCoeur = false,
    this.enPromotion = false,
    this.note,
    this.nombreVues,
    this.boutique,
    this.categorie,
    this.marque,
    required this.createdAt,
    required this.updatedAt,
  });

  // From JSON
  factory ProduitModel.fromJson(Map<String, dynamic> json) {
    final imageUrl = json['image_url'] ?? json['image_principale'];
    final imagesValue = json['images'];

    return ProduitModel(
      id: json['id'] as int,
      boutiqueId: json['boutique_id'] as int,
      categorieId: json['categorie_id'] as int?,
      marqueId: json['marque_id'] as int?,
      nom: json['nom'] as String,
      slug: json['slug'] as String,
      description:
          (json['description'] ?? json['description_courte']) as String?,
      prix: double.parse((json['prix'] ?? json['prix_vente']).toString()),
      prixPromo: json['prix_promo'] != null
          ? double.parse(json['prix_promo'].toString())
          : null,
      imageUrl: imageUrl as String?,
      images: imagesValue is List
          ? List<String>.from(imagesValue)
          : imageUrl != null
              ? [imageUrl as String]
              : null,
      stock: (json['stock'] ?? json['quantite_stock']) as int? ?? 0,
      disponible: json['disponible'] == true ||
          json['disponible'] == 1 ||
          json['statut'] == 'actif',
      nouveaute: json['nouveaute'] == true ||
          json['nouveaute'] == 1 ||
          json['est_nouveaute'] == true ||
          json['est_nouveaute'] == 1,
      coupDeCoeur: json['coup_de_coeur'] == true ||
          json['coup_de_coeur'] == 1 ||
          json['est_coup_coeur'] == true ||
          json['est_coup_coeur'] == 1,
      enPromotion: json['en_promotion'] == true ||
          json['en_promotion'] == 1 ||
          json['prix_promo'] != null,
      note: json['note'] != null
          ? double.parse(json['note'].toString())
          : json['note_moyenne'] != null
              ? double.parse(json['note_moyenne'].toString())
              : null,
      nombreVues: json['nombre_vues'] as int?,
      boutique: (json['boutique'] ?? json['nom_boutique']) as String?,
      categorie: (json['categorie'] ?? json['categorie_nom']) as String?,
      marque: (json['marque'] ?? json['marque_nom']) as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  // To JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'boutique_id': boutiqueId,
      'categorie_id': categorieId,
      'marque_id': marqueId,
      'nom': nom,
      'slug': slug,
      'description': description,
      'prix': prix,
      'prix_promo': prixPromo,
      'image_url': imageUrl,
      'images': images,
      'stock': stock,
      'disponible': disponible,
      'nouveaute': nouveaute,
      'coup_de_coeur': coupDeCoeur,
      'en_promotion': enPromotion,
      'note': note,
      'nombre_vues': nombreVues,
      'boutique': boutique,
      'categorie': categorie,
      'marque': marque,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  // Prix effectif (promo si existe, sinon prix normal)
  double get prixEffectif => prixPromo ?? prix;

  // Pourcentage de réduction
  int? get pourcentageReduction {
    if (prixPromo == null) return null;
    return ((1 - (prixPromo! / prix)) * 100).round();
  }

  // En stock
  bool get enStock => stock > 0 && disponible;

  // Copy with
  ProduitModel copyWith({
    int? id,
    int? boutiqueId,
    int? categorieId,
    int? marqueId,
    String? nom,
    String? slug,
    String? description,
    double? prix,
    double? prixPromo,
    String? imageUrl,
    List<String>? images,
    int? stock,
    bool? disponible,
    bool? nouveaute,
    bool? coupDeCoeur,
    bool? enPromotion,
    double? note,
    int? nombreVues,
    String? boutique,
    String? categorie,
    String? marque,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ProduitModel(
      id: id ?? this.id,
      boutiqueId: boutiqueId ?? this.boutiqueId,
      categorieId: categorieId ?? this.categorieId,
      marqueId: marqueId ?? this.marqueId,
      nom: nom ?? this.nom,
      slug: slug ?? this.slug,
      description: description ?? this.description,
      prix: prix ?? this.prix,
      prixPromo: prixPromo ?? this.prixPromo,
      imageUrl: imageUrl ?? this.imageUrl,
      images: images ?? this.images,
      stock: stock ?? this.stock,
      disponible: disponible ?? this.disponible,
      nouveaute: nouveaute ?? this.nouveaute,
      coupDeCoeur: coupDeCoeur ?? this.coupDeCoeur,
      enPromotion: enPromotion ?? this.enPromotion,
      note: note ?? this.note,
      nombreVues: nombreVues ?? this.nombreVues,
      boutique: boutique ?? this.boutique,
      categorie: categorie ?? this.categorie,
      marque: marque ?? this.marque,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
