/// Modèle Catégorie
class CategorieModel {
  final int id;
  final String nom;
  final String slug;
  final String? description;
  final String? icone;
  final int ordre;
  final bool actif;
  final DateTime createdAt;
  final DateTime updatedAt;

  CategorieModel({
    required this.id,
    required this.nom,
    required this.slug,
    this.description,
    this.icone,
    this.ordre = 0,
    this.actif = true,
    required this.createdAt,
    required this.updatedAt,
  });

  // From JSON
  factory CategorieModel.fromJson(Map<String, dynamic> json) {
    return CategorieModel(
      id: json['id'] as int,
      nom: json['nom'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      icone: json['icone'] as String?,
      ordre: json['ordre'] as int? ?? 0,
      actif: json['actif'] == true || json['actif'] == 1,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  // To JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nom': nom,
      'slug': slug,
      'description': description,
      'icone': icone,
      'ordre': ordre,
      'actif': actif,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  // Copy with
  CategorieModel copyWith({
    int? id,
    String? nom,
    String? slug,
    String? description,
    String? icone,
    int? ordre,
    bool? actif,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return CategorieModel(
      id: id ?? this.id,
      nom: nom ?? this.nom,
      slug: slug ?? this.slug,
      description: description ?? this.description,
      icone: icone ?? this.icone,
      ordre: ordre ?? this.ordre,
      actif: actif ?? this.actif,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
