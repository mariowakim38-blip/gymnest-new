import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Colors from '@/constants/colors';
import { galleryItems } from '@/constants/mockData';
import { trpc } from '@/lib/trpc';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 2;

export default function GalleryScreen() {
  const { data: dbGalleryItems = [] } = trpc.gallery.getAll.useQuery();
  const allGalleryItems = dbGalleryItems.length > 0 ? dbGalleryItems : galleryItems;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gallery</Text>
        <Text style={styles.headerSubtitle}>
          Moments from our training sessions and events
        </Text>
      </View>

      <View style={styles.gallery}>
        {allGalleryItems.map((item: any, index: number) => (
          <TouchableOpacity
            key={item.id}
            style={styles.galleryItem}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.url }} style={styles.galleryImage} />
            <View style={styles.captionOverlay}>
              <Text style={styles.captionText} numberOfLines={2}>
                {item.caption}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  galleryItem: {
    width: imageSize,
    height: imageSize,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  captionText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '500' as const,
  },
});
