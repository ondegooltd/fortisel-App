import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Clock,
  Star,
  X,
  Send,
} from 'lucide-react-native';
import { useSupportTickets, useProfile } from '@/hooks/useApi';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export default function HelpCenterScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketMessage, setTicketMessage] = useState('');
  const { createTicket } = useSupportTickets();
  const { getProfile } = useProfile();

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How do I place an order?',
      answer:
        'To place an order, go to the Request tab, select your cylinder size, enter the delivery details, and confirm your order. You can also schedule deliveries for later.',
      category: 'Orders',
    },
    {
      id: '2',
      question: 'What payment methods do you accept?',
      answer:
        'We accept cash on delivery, mobile money (MTN, Vodafone, AirtelTigo), and bank transfers. You can manage your payment methods in the Account section.',
      category: 'Payment',
    },
    {
      id: '3',
      question: 'How long does delivery take?',
      answer:
        'Standard delivery takes 2-4 hours within Accra and 4-6 hours for other regions. You can track your order in real-time through the app.',
      category: 'Delivery',
    },
    {
      id: '4',
      question: 'Can I cancel my order?',
      answer:
        'Yes, you can cancel your order within 30 minutes of placing it. Go to your Orders tab, select the order, and tap Cancel Order.',
      category: 'Orders',
    },
    {
      id: '5',
      question: "What if I'm not satisfied with my order?",
      answer:
        "We offer a 100% satisfaction guarantee. If you're not happy with your order, contact our support team within 24 hours for a full refund or replacement.",
      category: 'Support',
    },
    {
      id: '6',
      question: 'How do I track my order?',
      answer:
        "You can track your order in real-time through the Orders tab. You'll receive notifications when your order status changes.",
      category: 'Delivery',
    },
    {
      id: '7',
      question: 'Do you deliver on weekends?',
      answer:
        'Yes, we deliver 7 days a week including weekends and public holidays. Our delivery hours are 6 AM to 10 PM.',
      category: 'Delivery',
    },
    {
      id: '8',
      question: 'How do I change my delivery address?',
      answer:
        'You can update your delivery address in the Account section under Delivery Addresses. You can also add multiple addresses for convenience.',
      category: 'Account',
    },
  ];

  const supportOptions: SupportOption[] = [
    {
      id: '1',
      title: 'Create Support Ticket',
      description: 'Submit a support request to our team',
      icon: <MessageCircle size={24} color={COLORS.primary} />,
      action: () => {
        setShowTicketModal(true);
      },
    },
    {
      id: '2',
      title: 'Call Support',
      description: '+233 20 123 4567',
      icon: <Phone size={24} color={COLORS.primary} />,
      action: () => {
        Linking.openURL('tel:+233201234567');
      },
    },
    {
      id: '3',
      title: 'Email Support',
      description: 'support@fortisel.com',
      icon: <Mail size={24} color={COLORS.primary} />,
      action: () => {
        Linking.openURL('mailto:support@fortisel.com?subject=Support Request');
      },
    },
    {
      id: '4',
      title: 'User Guide',
      description: 'Complete guide to using Fortisel',
      icon: <FileText size={24} color={COLORS.primary} />,
      action: () => {
        // TODO: Open user guide
        alert('User guide will be available soon');
      },
    },
  ];

  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleCreateTicket = async () => {
    if (!ticketMessage.trim()) {
      Alert.alert(
        'Validation Error',
        'Please enter a message for your support ticket'
      );
      return;
    }

    try {
      const profileResult = await getProfile.execute();
      if (!profileResult?.success || !profileResult.data) {
        Alert.alert('Error', 'Unable to get user information');
        return;
      }

      const result = await createTicket.execute({
        userId: profileResult.data._id,
        message: ticketMessage.trim(),
        status: 'open',
      });

      if (result?.success) {
        Alert.alert(
          'Success',
          'Support ticket created successfully! Our team will respond soon.'
        );
        setTicketMessage('');
        setShowTicketModal(false);
      }
    } catch (error) {
      console.error('Failed to create support ticket:', error);
    }
  };

  const renderFAQItem = (item: FAQItem) => (
    <View key={item.id} style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => toggleFAQ(item.id)}
      >
        <View style={styles.faqQuestionContent}>
          <Text style={styles.faqCategory}>{item.category}</Text>
          <Text style={styles.faqQuestionText}>{item.question}</Text>
        </View>
        <ChevronRight
          size={20}
          color={COLORS.primary}
          style={[
            styles.chevron,
            expandedFAQ === item.id && styles.chevronRotated,
          ]}
        />
      </TouchableOpacity>
      {expandedFAQ === item.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );

  const renderSupportOption = (option: SupportOption) => (
    <TouchableOpacity
      key={option.id}
      style={styles.supportOption}
      onPress={option.action}
    >
      <View style={styles.supportIcon}>{option.icon}</View>
      <View style={styles.supportContent}>
        <Text style={styles.supportTitle}>{option.title}</Text>
        <Text style={styles.supportDescription}>{option.description}</Text>
      </View>
      <ChevronRight size={20} color={COLORS.lightGray} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search
              size={20}
              color={COLORS.lightGray}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              placeholderTextColor={COLORS.lightGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Clock size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>2-4 hrs</Text>
            <Text style={styles.statLabel}>Avg Response</Text>
          </View>
          <View style={styles.statItem}>
            <Star size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <HelpCircle size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Support</Text>
          </View>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          <View style={styles.supportOptions}>
            {supportOptions.map(renderSupportOption)}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Frequently Asked Questions
            {searchQuery && (
              <Text style={styles.searchResults}>
                {' '}
                ({filteredFAQ.length} results)
              </Text>
            )}
          </Text>
          <View style={styles.faqContainer}>
            {filteredFAQ.length > 0 ? (
              filteredFAQ.map(renderFAQItem)
            ) : searchQuery ? (
              <View style={styles.noResults}>
                <HelpCircle size={48} color={COLORS.lightGray} />
                <Text style={styles.noResultsTitle}>No results found</Text>
                <Text style={styles.noResultsText}>
                  Try searching with different keywords or contact our support
                  team.
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactDescription}>
            Our support team is here to help you 24/7. Don't hesitate to reach
            out!
          </Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL('tel:+233201234567')}
            >
              <Phone size={20} color="white" />
              <Text style={styles.contactButtonText}>Call Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactButton, styles.emailButton]}
              onPress={() => Linking.openURL('mailto:support@fortisel.com')}
            >
              <Mail size={20} color={COLORS.primary} />
              <Text style={[styles.contactButtonText, styles.emailButtonText]}>
                Email Us
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Support Ticket Modal */}
      <Modal
        visible={showTicketModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTicketModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Support Ticket</Text>
              <TouchableOpacity onPress={() => setShowTicketModal(false)}>
                <X size={24} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>
                Describe your issue or question
              </Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Enter your message here..."
                placeholderTextColor={COLORS.lightGray}
                value={ticketMessage}
                onChangeText={setTicketMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowTicketModal(false);
                  setTicketMessage('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSubmitButton,
                  (!ticketMessage.trim() || createTicket.loading) &&
                    styles.modalSubmitButtonDisabled,
                ]}
                onPress={handleCreateTicket}
                disabled={!ticketMessage.trim() || createTicket.loading}
              >
                <Send size={20} color="white" />
                <Text style={styles.modalSubmitButtonText}>
                  {createTicket.loading ? 'Submitting...' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.darkBackground,
    padding: 20,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkText,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.darkText,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.lightGray,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.darkText,
    marginBottom: 16,
  },
  searchResults: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.lightGray,
  },
  supportOptions: {
    gap: 12,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 16,
  },
  supportIcon: {
    marginRight: 16,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 4,
  },
  supportDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.lightGray,
  },
  faqContainer: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionContent: {
    flex: 1,
  },
  faqCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 4,
  },
  faqQuestionText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.darkText,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronRotated: {
    transform: [{ rotate: '90deg' }],
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  faqAnswerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkText,
    lineHeight: 20,
    marginTop: 12,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.darkText,
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  contactTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.darkText,
    marginBottom: 8,
  },
  contactDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.lightGray,
    lineHeight: 20,
    marginBottom: 20,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
  },
  emailButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  contactButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
    marginLeft: 8,
  },
  emailButtonText: {
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.darkText,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 12,
  },
  modalTextInput: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkText,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.darkText,
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modalSubmitButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  modalSubmitButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
  },
});
