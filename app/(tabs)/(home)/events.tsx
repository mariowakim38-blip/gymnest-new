import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  Megaphone,
  CalendarDays,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

export default function EventsScreen() {
  const { data: dbEvents = [] } = trpc.events.getAll.useQuery();
  const { data: dbAnnouncements = [] } = trpc.announcements.getAll.useQuery();

  const allEvents = dbEvents;
  const allAnnouncements = dbAnnouncements;

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

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case 'promotion':
        return Colors.gold;
      case 'event':
        return Colors.success;
      case 'info':
        return Colors.primary;
      default:
        return Colors.primary;
    }
  };

  const getImageUrl = (event: any) => {
    return event.image_url || event.imageUrl || '';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>

        {allEvents.length === 0 ? (
          <View style={styles.emptyCard}>
            <CalendarDays color={Colors.primary} size={34} />
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptyText}>
              Upcoming events will appear here when the admin adds them.
            </Text>
          </View>
        ) : (
          allEvents.map((event: any) => {
            const imageUrl = getImageUrl(event);

            return (
              <View key={event.id} style={styles.eventCard}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.eventImage} />
                ) : (
                  <View style={styles.eventImagePlaceholder}>
                    <CalendarDays color={Colors.white} size={42} />
                  </View>
                )}

                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>

                    <View
                      style={[
                        styles.eventTypeBadge,
                        { backgroundColor: getEventTypeColor(event.type) },
                      ]}
                    >
                      <Text style={styles.eventTypeBadgeText}>
                        {event.type}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.eventDescription}>
                    {event.description}
                  </Text>

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
                      <Text style={styles.eventDetailText}>
                        {event.location}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Announcements</Text>

        {allAnnouncements.length === 0 ? (
          <View style={styles.emptyCard}>
            <Megaphone color={Colors.primary} size={34} />
            <Text style={styles.emptyTitle}>No announcements yet</Text>
            <Text style={styles.emptyText}>
              Announcements will appear here when the admin adds them.
            </Text>
          </View>
        ) : (
          allAnnouncements.map((announcement: any) => (
            <View key={announcement.id} style={styles.announcementCard}>
              <View style={styles.announcementHeader}>
                <View
                  style={[
                    styles.announcementBadge,
                    {
                      backgroundColor: getAnnouncementTypeColor(
                        announcement.type
                      ),
                    },
                  ]}
                >
                  <Text style={styles.announcementBadgeText}>
                    {String(announcement.type).toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.announcementDate}>
                  {new Date(announcement.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>

              <Text style={styles.announcementTitle}>
                {announcement.title}
              </Text>

              <Text style={styles.announcementMessage}>
                {announcement.message}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    shadowColor: '#0B2447',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0B2447',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: 190,
    backgroundColor: Colors.lightGray,
  },
  eventImagePlaceholder: {
    width: '100%',
    height: 190,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventContent: {
    padding: 18,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  eventTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  eventTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  eventTypeBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  eventDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    marginBottom: 14,
  },
  eventDetails: {
    gap: 9,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  announcementCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    shadowColor: '#0B2447',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  announcementBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  announcementBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.7,
  },
  announcementDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  announcementTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 7,
  },
  announcementMessage: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
  },
});
