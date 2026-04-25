import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { events, announcements } from '@/constants/mockData';
import { trpc } from '@/lib/trpc';

export default function EventsScreen() {
  const { data: dbEvents = [] } = trpc.events.getAll.useQuery();
  const { data: dbAnnouncements = [] } = trpc.announcements.getAll.useQuery();
  
  const allEvents = dbEvents.length > 0 ? dbEvents : events;
  const allAnnouncements = dbAnnouncements.length > 0 ? dbAnnouncements : announcements;

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Competition':
        return Colors.error;
      case 'Workshop':
        return Colors.gold;
      case 'Showcase':
        return Colors.primary;
      case 'Camp':
        return Colors.success;
      default:
        return Colors.mediumGray;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {allEvents.map((event: any) => {
          const imageUrl = 'image_url' in event ? event.image_url : event.imageUrl;
          return (
            <View key={event.id} style={styles.eventCard}>
              <Image source={{ uri: imageUrl }} style={styles.eventImage} />
            <View style={styles.eventContent}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View
                  style={[
                    styles.eventTypeBadge,
                    { backgroundColor: getEventTypeColor(event.type) },
                  ]}
                >
                  <Text style={styles.eventTypeBadgeText}>{event.type}</Text>
                </View>
              </View>
              <Text style={styles.eventDescription}>{event.description}</Text>
              <View style={styles.eventDetails}>
                <View style={styles.eventDetailItem}>
                  <Calendar color={Colors.mediumGray} size={16} />
                  <Text style={styles.eventDetailText}>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.eventDetailItem}>
                  <Clock color={Colors.mediumGray} size={16} />
                  <Text style={styles.eventDetailText}>{event.time}</Text>
                </View>
                <View style={styles.eventDetailItem}>
                  <MapPin color={Colors.mediumGray} size={16} />
                  <Text style={styles.eventDetailText}>{event.location}</Text>
                </View>
              </View>
            </View>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Announcements</Text>
        {allAnnouncements.map((announcement: any) => (
          <View
            key={announcement.id}
            style={[
              styles.announcementCard,
              announcement.type === 'promotion' && styles.promotionCard,
            ]}
          >
            <View style={styles.announcementHeader}>
              <View
                style={[
                  styles.announcementBadge,
                  announcement.type === 'promotion' && styles.promotionBadge,
                  announcement.type === 'event' && styles.eventBadge,
                ]}
              >
                <Text style={styles.announcementBadgeText}>
                  {announcement.type.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.announcementDate}>
                {new Date(announcement.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <Text style={styles.announcementTitle}>{announcement.title}</Text>
            <Text style={styles.announcementMessage}>{announcement.message}</Text>
          </View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.lightGray,
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginRight: 8,
  },
  eventTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  eventDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: Colors.text,
  },
  announcementCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  promotionCard: {
    borderLeftColor: Colors.gold,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  promotionBadge: {
    backgroundColor: Colors.gold,
  },
  eventBadge: {
    backgroundColor: Colors.success,
  },
  announcementBadgeText: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  announcementDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  announcementMessage: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
});
