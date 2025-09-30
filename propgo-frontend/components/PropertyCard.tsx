import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useLanguage } from "../context/LanguageContext";

export type Property = {
  id: string;
  title: string;
  city: string;
  price: number; // INR
  area: number; // sqft
  verified: boolean;
  imageUrl?: string;
  category?: "Plot" | "Land" | "Home" | "Houses" | "Apartments";
};

type Props = {
  item: Property;
  onPress?: (id: string) => void;
};

export default function PropertyCard({ item, onPress }: Props) {
  const { t } = useLanguage();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress?.(item.id)}
      style={styles.card}
    >
      <Image
        source={{
          uri: item.imageUrl || "https://picsum.photos/seed/prop/400/240",
        }}
        style={styles.image}
      />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View
            style={[
              styles.badge,
              item.verified ? styles.badgeVerified : styles.badgeUnverified,
            ]}
          >
            <Text style={styles.badgeText}>
              {item.verified ? t("verified") : t("notVerified")}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>
          {item.city} • {item.area} sqft
        </Text>
        {/* <Text style={styles.price}>₹ {item.price.toLocaleString('en-IN')}</Text> */}
        <Text style={styles.price}>
          ₹{" "}
          {typeof item.price === "number"
            ? item.price.toLocaleString("en-IN")
            : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
  },
  image: { width: "100%", height: 160, backgroundColor: "#eaeaea" },
  content: { padding: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 16, fontWeight: "600", flex: 1, marginRight: 8 },
  meta: { color: "#666", marginTop: 4 },
  price: { marginTop: 6, fontSize: 16, fontWeight: "700" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeVerified: { backgroundColor: "#e7f7ed", borderColor: "#3dbd6b" },
  badgeUnverified: { backgroundColor: "#fff4f4", borderColor: "#ff6b6b" },
  badgeText: { fontSize: 11, color: "#333" },
});
