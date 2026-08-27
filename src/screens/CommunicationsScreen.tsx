import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';
import { ChatThread, ChatMessage, DisputeItem, SupportTicket, LinkedProductContext, LinkedDeliveryTrackerContext } from '../types';

type CommsTab = 'CHAT' | 'ALERTS' | 'DISPUTES' | 'TICKETS';

export const CommunicationsScreen: React.FC = () => {
  const {
    threads,
    messages,
    notifications,
    disputes,
    tickets,
    sendChatMessage,
    markNotificationRead,
    products,
    consignments,
  } = useApp();

  const [activeTab, setActiveTab] = useState<CommsTab>('CHAT');
  const [selectedThread, setSelectedThread] = useState<ChatThread>(threads[0]);
  const [inputMessage, setInputMessage] = useState('');

  // Context attachment modal
  const [attachModalVisible, setAttachModalVisible] = useState(false);
  const [attachedProduct, setAttachedProduct] = useState<LinkedProductContext | null>(null);
  const [attachedTracker, setAttachedTracker] = useState<LinkedDeliveryTrackerContext | null>(null);

  const unreadAlerts = notifications.filter((n) => !n.isRead).length;
  const pendingDisputes = disputes.filter((d) => d.status !== 'Resolved').length;
  const openTickets = tickets.filter((t) => t.status !== 'Resolved').length;

  const activeMessages: ChatMessage[] = selectedThread ? (messages[selectedThread.id] || []) : [];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !attachedProduct && !attachedTracker) return;

    await sendChatMessage(
      selectedThread.id,
      inputMessage.trim(),
      attachedProduct || attachedTracker
        ? {
            product: attachedProduct || undefined,
            tracker: attachedTracker || undefined,
          }
        : undefined
    );

    setInputMessage('');
    setAttachedProduct(null);
    setAttachedTracker(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.pageInner}>
        {/* Top Tab Bar */}
        <View style={styles.tabNav}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'CHAT' && styles.tabButtonActive]}
            onPress={() => setActiveTab('CHAT')}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={15}
              color={activeTab === 'CHAT' ? COLORS.primaryLight : COLORS.textMuted}
            />
            <Text style={[styles.tabButtonText, activeTab === 'CHAT' && styles.tabButtonTextActive]}>
              Chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'ALERTS' && styles.tabButtonActive]}
            onPress={() => setActiveTab('ALERTS')}
          >
            <Ionicons
              name="notifications-outline"
              size={15}
              color={activeTab === 'ALERTS' ? COLORS.blueLight : COLORS.textMuted}
            />
            <Text style={[styles.tabButtonText, activeTab === 'ALERTS' && styles.tabButtonTextActive]}>
              Alerts ({unreadAlerts})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'DISPUTES' && styles.tabButtonActive]}
            onPress={() => setActiveTab('DISPUTES')}
          >
            <MaterialCommunityIcons
              name="scale-balance"
              size={15}
              color={activeTab === 'DISPUTES' ? COLORS.danger : COLORS.textMuted}
            />
            <Text style={[styles.tabButtonText, activeTab === 'DISPUTES' && styles.tabButtonTextActive]}>
              Disputes ({pendingDisputes})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'TICKETS' && styles.tabButtonActive]}
            onPress={() => setActiveTab('TICKETS')}
          >
            <MaterialCommunityIcons
              name="lifebuoy"
              size={15}
              color={activeTab === 'TICKETS' ? COLORS.gold : COLORS.textMuted}
            />
            <Text style={[styles.tabButtonText, activeTab === 'TICKETS' && styles.tabButtonTextActive]}>
              Tickets ({openTickets})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Multi-Threaded Chat with Rich Context */}
        {activeTab === 'CHAT' && (
          <View style={styles.chatContainer}>
            {/* Thread selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.threadScroll}
            >
              {threads.map((th) => {
                const isSelected = selectedThread?.id === th.id;
                return (
                  <TouchableOpacity
                    key={th.id}
                    style={[styles.threadPill, isSelected && styles.threadPillSelected]}
                    onPress={() => setSelectedThread(th)}
                  >
                    <View style={styles.threadDot} />
                    <View>
                      <Text style={[styles.threadPillTitle, isSelected && { color: COLORS.textLight, fontWeight: '700' }]}>
                        {th.participantName}
                      </Text>
                      <Text style={styles.threadPillRole}>{th.participantRole}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Chat Messages */}
            <ScrollView style={styles.messagesList} contentContainerStyle={styles.messagesListContent}>
              {activeMessages.map((msg) => {
                const isMe = msg.senderId === 'me';

                return (
                  <View key={msg.id} style={[styles.msgWrapper, isMe ? styles.msgWrapperMe : styles.msgWrapperThem]}>
                    <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleThem]}>
                      <Text style={styles.msgSender}>{msg.senderName}</Text>
                      <Text style={styles.msgText}>{msg.messageText}</Text>

                      {/* Embedded Product Context */}
                      {msg.linkedProduct && (
                        <View style={styles.msgContextCard}>
                          <View style={styles.contextHeader}>
                            <MaterialCommunityIcons name="cube-outline" size={13} color={COLORS.primaryLight} />
                            <Text style={styles.contextHeaderTitle}>ATTACHED PRODUCT SKU</Text>
                          </View>
                          <Text style={styles.contextDataText}>{msg.linkedProduct.name}</Text>
                          <Text style={styles.contextAmount}>N${msg.linkedProduct.sellPrice.toFixed(2)}</Text>
                        </View>
                      )}

                      {/* Embedded Delivery Tracker Context */}
                      {msg.linkedDeliveryTracker && (
                        <View style={styles.msgContextCard}>
                          <View style={styles.contextHeader}>
                            <MaterialCommunityIcons name="map-marker-path" size={13} color={COLORS.blueLight} />
                            <Text style={[styles.contextHeaderTitle, { color: COLORS.blueLight }]}>ATTACHED CONSIGNMENT</Text>
                          </View>
                          <Text style={styles.contextDataText}>#{msg.linkedDeliveryTracker.trackingId}</Text>
                          <Text style={styles.contextMeta}>
                            {msg.linkedDeliveryTracker.origin} ➔ {msg.linkedDeliveryTracker.destination} ({msg.linkedDeliveryTracker.status})
                          </Text>
                        </View>
                      )}

                      <Text style={styles.msgTime}>
                        {new Date(msg.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Attached Context Preview */}
            {(attachedProduct || attachedTracker) && (
              <View style={styles.attachedPreviewBar}>
                <MaterialCommunityIcons name="paperclip" size={14} color={COLORS.primaryLight} />
                <Text style={styles.attachedPreviewText} numberOfLines={1}>
                  Attached: {attachedProduct ? attachedProduct.name : attachedTracker?.trackingId}
                </Text>
                <TouchableOpacity onPress={() => { setAttachedProduct(null); setAttachedTracker(null); }}>
                  <Feather name="x" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            )}

            {/* Input Bar */}
            <View style={styles.inputBar}>
              <TouchableOpacity
                style={styles.attachBtn}
                onPress={() => setAttachModalVisible(true)}
              >
                <MaterialCommunityIcons name="paperclip" size={18} color={COLORS.blueLight} />
              </TouchableOpacity>

              <TextInput
                style={styles.textInput}
                placeholder="Type message to supplier or driver..."
                placeholderTextColor={COLORS.textMuted}
                value={inputMessage}
                onChangeText={setInputMessage}
              />

              <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                <Ionicons name="send" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tab 2: Notifications & Alerts */}
        {activeTab === 'ALERTS' && (
          <ScrollView style={styles.tabContentScroll}>
            {notifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                style={[styles.notifCard, !notif.isRead && styles.notifUnread]}
                onPress={() => markNotificationRead(notif.id)}
              >
                <View
                  style={[
                    styles.notifPriorityDot,
                    notif.priority === 'CRITICAL'
                      ? { backgroundColor: COLORS.danger }
                      : notif.priority === 'HIGH'
                      ? { backgroundColor: COLORS.warning }
                      : { backgroundColor: COLORS.blueLight },
                  ]}
                />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifBody}>{notif.message}</Text>
                  <Text style={styles.notifTime}>
                    {new Date(notif.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • via {notif.channel}
                  </Text>
                </View>
                {!notif.isRead && <View style={styles.unreadPill} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Tab 3: Disputes */}
        {activeTab === 'DISPUTES' && (
          <ScrollView style={styles.tabContentScroll}>
            {disputes.map((d) => (
              <View key={d.id} style={styles.disputeCard}>
                <View style={styles.disputeHeader}>
                  <Text style={styles.disputeId}>#{d.id} • {d.subject}</Text>
                  <Text style={[styles.disputeStatus, d.status === 'Resolved' && { color: COLORS.primaryLight }]}>
                    {d.status}
                  </Text>
                </View>
                <Text style={styles.disputeParty}>Category: {d.category}</Text>
                <Text style={styles.disputeAmount}>Claim Amount: N${d.amount.toFixed(2)}</Text>
                <Text style={styles.disputeNotes}>{d.description}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Tab 4: Support SLA Tickets */}
        {activeTab === 'TICKETS' && (
          <ScrollView style={styles.tabContentScroll}>
            {tickets.map((tk) => (
              <View key={tk.id} style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketId}>#{tk.id}</Text>
                  <Text style={styles.ticketSla}>SLA: {tk.slaTimerMinutes}m</Text>
                </View>
                <Text style={styles.ticketSubject}>{tk.subject}</Text>
                <Text style={styles.ticketCategory}>Category: {tk.category} • Assigned: {tk.assignedAgent}</Text>
                <Text style={styles.ticketDesc}>{tk.description}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Attach Context Modal */}
      <Modal
        visible={attachModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAttachModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Attach Live Commerce Context</Text>
              <TouchableOpacity onPress={() => setAttachModalVisible(false)}>
                <Feather name="x" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={styles.contextGroupHeader}>PRODUCT SKUS</Text>
              {products.slice(0, 3).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.contextPickItem}
                  onPress={() => {
                    setAttachedProduct({
                      id: p.id,
                      name: p.name,
                      sellPrice: p.sellPrice,
                      stockQty: p.stockQty,
                    });
                    setAttachModalVisible(false);
                  }}
                >
                  <Text style={styles.pickTitle}>{p.name}</Text>
                  <Text style={styles.pickSub}>N${p.sellPrice.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.contextGroupHeader, { marginTop: 8 }]}>FREIGHT CONSIGNMENTS</Text>
              {consignments.map((c) => (
                <TouchableOpacity
                  key={c.trackingId}
                  style={styles.contextPickItem}
                  onPress={() => {
                    setAttachedTracker({
                      trackingId: c.trackingId,
                      origin: c.origin,
                      destination: c.destination,
                      status: c.status,
                    });
                    setAttachModalVisible(false);
                  }}
                >
                  <Text style={styles.pickTitle}>#{c.trackingId} • {c.cargoDescription}</Text>
                  <Text style={styles.pickSub}>{c.status}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgCanvas,
  },
  pageInner: {
    flex: 1,
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    padding: 12,
  },
  tabNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 8,
    padding: 3,
    marginBottom: 10,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 6,
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: COLORS.surfaceDarkElevated,
  },
  tabButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabButtonTextActive: {
    color: COLORS.textLight,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    overflow: 'hidden',
  },
  threadScroll: {
    padding: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  threadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 6,
  },
  threadPillSelected: {
    backgroundColor: COLORS.blueMuted,
    borderColor: COLORS.blueLight,
    borderWidth: 1,
  },
  threadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryLight,
  },
  threadPillTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSub,
  },
  threadPillRole: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    padding: 10,
    gap: 8,
  },
  msgWrapper: {
    flexDirection: 'row',
  },
  msgWrapperMe: {
    justifyContent: 'flex-end',
  },
  msgWrapperThem: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '80%',
    borderRadius: 10,
    padding: 8,
  },
  msgBubbleMe: {
    backgroundColor: COLORS.blueDark,
  },
  msgBubbleThem: {
    backgroundColor: COLORS.surfaceDarkElevated,
  },
  msgSender: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSub,
    marginBottom: 2,
  },
  msgText: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 16,
  },
  msgTime: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  msgContextCard: {
    backgroundColor: COLORS.bgDark,
    borderRadius: 6,
    padding: 6,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryLight,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contextHeaderTitle: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  contextDataText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 2,
  },
  contextAmount: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  contextMeta: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  attachedPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    gap: 6,
  },
  attachedPreviewText: {
    fontSize: 10,
    color: COLORS.textLight,
    flex: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    backgroundColor: COLORS.surfaceDarkElevated,
    gap: 6,
  },
  attachBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: COLORS.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: 34,
    backgroundColor: COLORS.bgDark,
    borderRadius: 6,
    paddingHorizontal: 8,
    color: COLORS.textLight,
    fontSize: 11,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContentScroll: {
    flex: 1,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  notifUnread: {
    borderColor: COLORS.blueLight,
  },
  notifPriorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  notifBody: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  notifTime: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  unreadPill: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.blueLight,
  },
  disputeCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  disputeId: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  disputeStatus: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.danger,
  },
  disputeParty: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  disputeAmount: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gold,
    marginTop: 2,
  },
  disputeNotes: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  ticketCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketId: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.blueLight,
  },
  ticketSla: {
    fontSize: 9,
    color: COLORS.gold,
    fontWeight: '700',
  },
  ticketSubject: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 2,
  },
  ticketCategory: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  ticketDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  contextGroupHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  contextPickItem: {
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    padding: 8,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickTitle: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  pickSub: {
    fontSize: 10,
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
});
